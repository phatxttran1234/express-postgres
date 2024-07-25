const express = require('express');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const createTables = async () => {
  try {
    const userTableQuery = `
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL
      );
    `;
    await pool.query(userTableQuery);

    const postTableQuery = `
      CREATE TABLE IF NOT EXISTS Posts (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE
      );
    `;
    await pool.query(postTableQuery);

    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables', err);
  }
};

// Initialize tables
createTables();

// Add a new user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Add a new post for a user
app.post('/posts', async (req, res) => {
  const { userId, title, body } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Posts (userId, title, body) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, body]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
