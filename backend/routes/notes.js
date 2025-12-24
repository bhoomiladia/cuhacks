const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = './data/notes.json';

const getNotes = () => JSON.parse(fs.readFileSync(DATA_FILE));
const saveNotes = (notes) => fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2));

// GET all notes
router.get('/', (req, res) => {
  res.json(getNotes());
});

// GET notes by task
router.get('/task/:taskId', (req, res) => {
  const notes = getNotes().filter(n => n.taskId === req.params.taskId);
  res.json(notes);
});

// POST create note
router.post('/', (req, res) => {
  const notes = getNotes();
  const newNote = {
    id: uuidv4(),
    taskId: req.body.taskId || null,
    content: req.body.content || '',
    type: req.body.type || 'user', // 'user' or 'ai-summary'
    createdAt: new Date().toISOString()
  };
  notes.push(newNote);
  saveNotes(notes);
  res.status(201).json(newNote);
});

// DELETE note
router.delete('/:id', (req, res) => {
  let notes = getNotes();
  notes = notes.filter(n => n.id !== req.params.id);
  saveNotes(notes);
  res.json({ message: 'Note deleted' });
});

module.exports = router;