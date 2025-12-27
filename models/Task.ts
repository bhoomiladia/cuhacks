import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  fileUrl: {
    type: String,
  },
  fileName: {
    type: String,
  },
  assignedAgent: {
    type: String,
    default: 'Planner',
  },
  type: {
    type: String,
    enum: ['NORMAL', 'EMAIL_ACTION'],
    default: 'NORMAL',
  },
  emailIntent: {
    type: String,
    enum: ['READ', 'DRAFT', 'SEND'],
    default: null,
  },
  tags: {
    type: [String],
    default: [],
  },
  // Agent execution fields
  executionStatus: {
    type: String,
    enum: ['idle', 'running', 'completed', 'failed'],
    default: 'idle',
  },
  taskUnderstanding: {
    type: String,
  },
  executionPlan: {
    type: String,
  },
  intermediateSteps: {
    type: [String],
    default: [],
  },
  finalResult: {
    type: String,
  },
  executionStartedAt: {
    type: Date,
  },
  executionCompletedAt: {
    type: Date,
  },
  // Email generation fields
  emailDraft: {
    subject: String,
    body: String,
    recipient: String,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  sentAt: {
    type: Date,
  },
  // Chat messages
  chatMessages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  // Execution logs for background agents
  executionLogs: [{
    agent: String,
    step: String,
    status: {
      type: String,
      enum: ['running', 'completed', 'failed'],
    },
    output: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
