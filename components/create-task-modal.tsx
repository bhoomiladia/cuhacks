'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Mic, Calendar as CalendarIcon, Check, Upload, FileText, ChevronLeft, ChevronRight, File, FileType, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
      priority
    });
    // Reset form
    setTitle('');
    setDescription('');
    setDueDate(null);
    setPriority('medium');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-background shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Create New Task</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <div className="relative">
                <Input
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Speak or type task title"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => startRecognition('title')}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 ${isListening && activeFieldRef.current === 'title' ? 'text-primary' : 'text-muted-foreground hover:bg-accent'}`}
                >
                  <Mic className="h-4 w-4" />
                </button>
                {isListening && activeFieldRef.current === 'title' && (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    Listening...
                  </span>
                )}
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Task Description</Label>
              <div className="relative">
                <Textarea
                  id="description"
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe the task for AI agents"
                  rows={4}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => startRecognition('description')}
                  className={`absolute right-2 top-2 rounded-full p-1 ${isListening && activeFieldRef.current === 'description' ? 'text-primary' : 'text-muted-foreground hover:bg-accent'}`}
                >
                  <Mic className="h-4 w-4" />
                </button>
                {isListening && activeFieldRef.current === 'description' && (
                  <span className="absolute right-10 top-3 text-xs text-muted-foreground">
                    Listening...
                  </span>
                )}
              </div>
            </div>

            {/* Due Date Field */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal hover:bg-accent/90",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-2">
                    <Calendar
                      mode="single"
                      selected={dueDate || undefined}
                      onSelect={(date: Date | undefined) => setDueDate(date || null)}
                      initialFocus
                      className="rounded-md border bg-background"
                      classNames={{
                        months: "p-2",
                        month: "space-y-3",
                        caption: "flex justify-center pt-1 relative items-center mb-2",
                        caption_label: "text-sm font-medium",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 p-0 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex justify-between",
                        head_cell: "text-muted-foreground rounded-md w-8 font-normal text-xs",
                        row: "flex w-full mt-1",
                        cell: "h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-8 w-8 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground border border-border",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible"
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
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Priority Field */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <Label>Supporting Documents</Label>
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                  isDragging ? "border-primary bg-accent/20" : "border-border hover:border-primary/50",
                  "flex flex-col items-center justify-center space-y-3 min-h-[180px]"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleFileChange}
              >
                <div className="p-3 rounded-full bg-accent">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    <span className="text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, JPG, PNG (max 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  id="document-upload"
                />
              </div>

              {selectedFile && (
                <div className="mt-3">
                  <div className="flex items-center justify-between rounded-lg border bg-background p-3 hover:bg-accent/10 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {selectedFile.type === 'application/pdf' ? (
                        <div className="h-10 w-10 flex items-center justify-center rounded-md bg-red-50 dark:bg-red-900/20">
                          <FileText className="h-5 w-5 text-red-500" />
                        </div>
                      ) : selectedFile.type.startsWith('image/') ? (
                        <div className="h-10 w-10 flex items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/20">
                          <ImageIcon className="h-5 w-5 text-blue-500" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/20">
                          <FileType className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
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
                      className="ml-2 rounded-full p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Check className="mr-2 h-4 w-4" />
              Save Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
