'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Mic, Calendar as CalendarIcon, Check, Upload, FileText, ChevronLeft, ChevronRight, FileType, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';


// Type definitions for Web Speech API
declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: {
      prototype: SpeechRecognition;
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      prototype: SpeechRecognition;
      new (): SpeechRecognition;
    };
  }
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: {
    title: string;
    description: string;
    dueDate: Date | null;
    priority: 'low' | 'medium' | 'high';
    file: File | null;
  }) => void;
}

const formatDate = (date: Date | null | undefined): string => {
  if (!date) return 'No date selected';
  return format(date, 'PPP');
};

export function CreateTaskModal({ isOpen, onClose, onSave }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const activeFieldRef = useRef<'title' | 'description' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = 'dataTransfer' in e ? 
      (e as React.DragEvent<HTMLDivElement>).dataTransfer.files : 
      (e as React.ChangeEvent<HTMLInputElement>).target.files;

    if (files && files.length > 0) {
      const file = files[0];
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      
      if (validTypes.includes(file.type) || 
          file.name.endsWith('.doc') || 
          file.name.endsWith('.docx')) {
        setSelectedFile(file);
      } else {
        console.error('Unsupported file type');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
      stopRecognition();
    };
  }, [isOpen, onClose]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, []);

  const startRecognition = (field: 'title' | 'description') => {
    stopRecognition();
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      activeFieldRef.current = field;
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      if (activeFieldRef.current === 'title') {
        setTitle(prev => prev ? `${prev} ${transcript}` : transcript);
      } else if (activeFieldRef.current === 'description') {
        setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
      }
    };

    recognition.onend = () => {
      stopRecognition();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      stopRecognition();
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      stopRecognition();
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors when stopping already stopped recognition
      }
      recognitionRef.current = null;
    }
    activeFieldRef.current = null;
    setIsListening(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      file: selectedFile
    });
    // Reset form
    setTitle('');
    setDescription('');
    setDueDate(null);
    setPriority('medium');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#15151b] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-6 bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">Create New Task</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FC90AF] font-bold mt-0.5">Initialize Neural Pipeline</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-8 custom-scrollbar">
          <div className="space-y-6">
            
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-gray-400">Task Title</Label>
              <div className="relative group">
                <Input
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Speak or type task title"
                  required
                  className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-[#FC90AF]/50 focus:ring-0 text-white placeholder:text-gray-600 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => startRecognition('title')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-all ${isListening && activeFieldRef.current === 'title' ? 'bg-[#FC90AF] text-[#15151b] animate-pulse' : 'text-gray-500 hover:bg-white/10'}`}
                >
                  <Mic className="h-4 w-4" />
                </button>
                {isListening && (
                  <span className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#FC90AF] animate-pulse">
                    LISTENING...
                  </span>
                )}
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-gray-400">Task Description</Label>
              <div className="relative">
                <Textarea
                  id="description"
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe the task for AI agents"
                  rows={4}
                  className="bg-white/5 border-white/10 rounded-xl focus:border-[#FC90AF]/50 focus:ring-0 text-white placeholder:text-gray-600 transition-all resize-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => startRecognition('description')}
                  className={`absolute right-3 bottom-3 rounded-lg p-1.5 transition-all ${isListening && activeFieldRef.current === 'description' ? 'bg-[#FC90AF] text-[#15151b] animate-pulse' : 'text-gray-500 hover:bg-white/10'}`}
                >
                  <Mic className="h-4 w-4" />
                </button>
                {isListening && activeFieldRef.current === 'description' && (
                  <span className="absolute right-12 bottom-4 text-[10px] font-bold text-[#FC90AF] animate-pulse">
                    LISTENING...
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
 {/* Due Date Field */}
<div className="space-y-2">
  <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Due Date</Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-medium bg-white/5 border-white/10 rounded-xl hover:bg-white/10 hover:text-white h-12 transition-all",
          !dueDate && "text-gray-600"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-[#FC90AF]" />
        <span className="truncate text-xs">
          {dueDate ? format(dueDate, "MMM dd, yyyy") : "Pick date"}
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent 
      className="w-auto p-0 bg-[#15151b]/90 backdrop-blur-xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden" 
      align="start"
    >
      <Calendar
        mode="single"
        selected={dueDate || undefined}
        onSelect={(date: Date | undefined) => setDueDate(date || null)}
        initialFocus
        className="p-3"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-2 relative items-center px-8",
          caption_label: "text-sm font-black uppercase tracking-widest text-white",
          nav: "space-x-1 flex items-center",
          nav_button: "h-8 w-8 bg-white/5 p-0 text-gray-400 hover:text-[#FC90AF] hover:bg-white/10 rounded-lg transition-all",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex mb-2",
          // FIXED: This ensures Mon, Tue, etc. are visible (gray-400)
          head_cell: "text-gray-400 rounded-md w-9 font-bold text-[10px] uppercase tracking-tighter",
          row: "flex w-full mt-1",
          cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          // FIXED: Default day color
          day: "h-9 w-9 p-0 font-medium text-gray-300 hover:bg-[#FC90AF]/20 hover:text-[#FC90AF] rounded-xl transition-all",
          day_selected: "bg-[#FC90AF] text-[#15151b] hover:bg-[#FC90AF] hover:text-[#15151b] focus:bg-[#FC90AF] focus:text-[#15151b] font-black rounded-xl shadow-[0_0_15px_rgba(252,144,175,0.4)]",
          day_today: "bg-white/10 text-[#FC90AF] border border-[#FC90AF]/30",
          // FIXED: Days from other months
          day_outside: "text-gray-700 opacity-30",
          day_disabled: "text-gray-800 opacity-50",
          day_hidden: "invisible",
        }}
        components={{
          Chevron: ({ ...props }) => {
            if (props.orientation === 'left') {
              return <ChevronLeft className="h-4 w-4" {...props} />;
            }
            return <ChevronRight className="h-4 w-4" {...props} />;
          }
        }}
      />
    </PopoverContent>
  </Popover>
</div>

              {/* Priority Field */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-widest text-gray-400">Priority</Label>
                <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                  <SelectTrigger className="w-full h-12 bg-white/5 border-white/10 rounded-xl focus:ring-0 text-white text-xs font-medium">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a23] border-white/10 text-white">
                    <SelectItem value="low" className="text-blue-400 focus:bg-white/10 focus:text-blue-400">Low</SelectItem>
                    <SelectItem value="medium" className="text-yellow-400 focus:bg-white/10 focus:text-yellow-400">Medium</SelectItem>
                    <SelectItem value="high" className="text-red-400 focus:bg-white/10 focus:text-red-400">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Supporting Documents</Label>
              <div 
                className={cn(
                  "border border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group",
                  isDragging ? "border-[#FC90AF] bg-[#FC90AF]/5" : "border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]",
                  "flex flex-col items-center justify-center space-y-3 min-h-[140px]"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleFileChange}
              >
                <div className="p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5 text-[#FC90AF]" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">
                    <span className="text-[#FC90AF]">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    PDF, DOC, DOCX, JPG, PNG (max 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
              </div>

              <AnimatePresence>
                {selectedFile && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -10 }}
                    className="mt-3"
                  >
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/[0.07] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        {selectedFile.type === 'application/pdf' ? (
                          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-red-500/10">
                            <FileText className="h-5 w-5 text-red-400" />
                          </div>
                        ) : selectedFile.type.startsWith('image/') ? (
                          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-500/10">
                            <ImageIcon className="h-5 w-5 text-blue-400" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-purple-500/10">
                            <FileType className="h-5 w-5 text-purple-400" />
                          </div>
                        )}
                        
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                            {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type.split('/').pop()?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-12 border-white/10 bg-transparent text-gray-400 hover:bg-white/5 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 bg-[#FC90AF] hover:bg-[#f985a6] text-[#15151b] font-black rounded-xl transition-all hover:scale-[1.02]"
            >
              <Check className="mr-2 h-4 w-4 stroke-[3px]" /> Initialize
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
