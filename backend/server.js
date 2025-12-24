const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const tasksRoutes = require('./routes/tasks');
const notesRoutes = require('./routes/notes');
const emailsRoutes = require('./routes/emails');

app.use('/api/tasks', tasksRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/emails', emailsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running! 🚀' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});