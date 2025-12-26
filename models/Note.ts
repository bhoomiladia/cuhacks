import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // AI-generated attributes
  category: {
    type: String, // e.g., "Technical", "Work-Life", "Strategic"
  },
  sentiment: {
    type: String,
    enum: ['high', 'neutral', 'low'],
  },
  aiSummary: {
    type: String, // A 5-7 word "TL;DR" of the note
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);