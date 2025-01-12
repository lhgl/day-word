const express = require('express');
const Solver = require('./solver');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Sample route to solve Wordle
app.post('/solve', (req, res) => {
    const { clues } = req.body;
    const solver = new Solver();
    const possibleWords = solver.solve(clues);
    res.json({ possibleWords });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});