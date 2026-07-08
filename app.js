const express = require('express');

const app = express();

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello World! My first CI/CD pipeline 🚀' });
});

// Health check route (useful for deployment platforms to verify the app is alive)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Simple add route to demonstrate logic worth testing
app.get('/add', (req, res) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);

  if (Number.isNaN(a) || Number.isNaN(b)) {
    return res.status(400).json({ error: 'Please provide valid numbers for a and b' });
  }

  res.status(200).json({ result: a + b });
});

module.exports = app;
