const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = './data/tasks.json';

// Helper: Read tasks
const getTasks = () => {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
};

// Helper: Save tasks
const saveTasks = (tasks) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
};

// GET all tasks
router.get('/', (req, res) => {
  const tasks = getTasks();
  res.json(tasks);
});

// GET single task
router.get('/:id', (req, res) => {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST create task
router.post('/', (req, res) => {
  const tasks = getTasks();
  const newTask = {
    id: uuidv4(),
    title: req.body.title || 'Untitled Task',
    description: req.body.description || '',
    dueDate: req.body.dueDate || null,
    status: 'pending',
    documents: req.body.documents || [],
    aiOutput: null,
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  saveTasks(tasks);
  res.status(201).json(newTask);
});

// PUT update task
router.put('/:id', (req, res) => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  
  tasks[index] = { ...tasks[index], ...req.body };
  saveTasks(tasks);
  res.json(tasks[index]);
});

// DELETE task
router.delete('/:id', (req, res) => {
  let tasks = getTasks();
  tasks = tasks.filter(t => t.id !== req.params.id);
  saveTasks(tasks);
  res.json({ message: 'Task deleted' });
});

// POST save AI output to task
router.post('/:id/ai-output', (req, res) => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  
  tasks[index].aiOutput = {
    breakdown: req.body.breakdown || [],
    insights: req.body.insights || [],
    summary: req.body.summary || '',
    updatedAt: new Date().toISOString()
  };
  saveTasks(tasks);
  res.json(tasks[index]);
});

module.exports = router;