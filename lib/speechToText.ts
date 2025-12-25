// Speech recognition type definitions
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
    item: (index: number) => any;
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
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

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    } | undefined;
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    } | undefined;
  }
}

export interface SpeechToTextOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class SpeechToText {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private options: SpeechToTextOptions;

  constructor(options: SpeechToTextOptions) {
    this.options = options;
  }

  public start() {
    if (this.isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.options.onError?.('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.options.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript || '')
        .join('');
      
      if (event.results[0]?.isFinal) {
        this.options.onResult(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.options.onError?.(event.error);
      this.stop();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.options.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (err) {
      this.options.onError?.('Error starting speech recognition');
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  source: string;
  createdAt: string;
}

export function createTaskFromTranscript(transcript: string): Task {
  if (!transcript.trim()) {
    throw new Error('Transcript is empty');
  }

  // Extract first sentence for the title
  const sentences = transcript.match(/[^.!?]+[.!?]+/g) || [transcript];
  const title = sentences[0].trim();
  const now = new Date().toISOString();
  
  const newTask: Task = {
    id: `local-${Date.now()}`,
    title: title.length > 100 ? title.substring(0, 100) + '...' : title,
    description: transcript,
    status: 'pending',
    source: 'dashboard_voice',
    createdAt: now
  };

  // Get existing tasks from localStorage
  const existingTasks = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('tasks') || '[]') 
    : [];
  
  // Add new task to the beginning of the array
  const updatedTasks = [newTask, ...existingTasks];
  
  // Save back to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  }

  return newTask;
}

export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}

export function getTaskById(id: string): Task | undefined {
  const tasks = getTasks();
  return tasks.find(task => task.id === id);
}
