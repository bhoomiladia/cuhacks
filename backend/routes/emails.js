const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const DATA_FILE = './data/emails.json';

const getEmails = () => JSON.parse(fs.readFileSync(DATA_FILE));
const saveEmails = (emails) => fs.writeFileSync(DATA_FILE, JSON.stringify(emails, null, 2));

// Email transporter (configure with your email)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// GET all emails
router.get('/', (req, res) => {
  res.json(getEmails());
});

// POST save email draft
router.post('/draft', (req, res) => {
  const emails = getEmails();
  const newEmail = {
    id: uuidv4(),
    taskId: req.body.taskId || null,
    to: req.body.to || '',
    subject: req.body.subject || '',
    body: req.body.body || '',
    status: 'draft',
    createdAt: new Date().toISOString()
  };
  emails.push(newEmail);
  saveEmails(emails);
  res.status(201).json(newEmail);
});

// POST send email (user approved)
router.post('/send/:id', async (req, res) => {
  const emails = getEmails();
  const index = emails.findIndex(e => e.id === req.params.id);
  
  if (index === -1) return res.status(404).json({ error: 'Email not found' });
  
  const email = emails[index];
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email.to,
      subject: email.subject,
      text: email.body
    });
    
    emails[index].status = 'sent';
    emails[index].sentAt = new Date().toISOString();
    saveEmails(emails);
    
    res.json({ message: 'Email sent!', email: emails[index] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

module.exports = router;