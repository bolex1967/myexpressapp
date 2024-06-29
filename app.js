// Rest API
// Замість ES6 будемо використовувати CommonJS

const express = require("express");
const sqlite3 = require("sqlite3");
const app = express();
const port = 3000;

// Used Middleware to parse JSON bodies
app.use(express.json());

// Create an in-memory SQLite database
const db = new sqlite3.Database(":memory:");
// Create a database structure
// Initialize a table
db.serialize(() => {
  db.run(
    "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)"
  );
});

// CRUD API Endpoints
// Create a new user

// In-memory "database" for demonstration purposes («База даних» у пам’яті для демонстраційних цілей.)
// let users = {};

// *** GET ********************************************************************
// GET request for fetching all users (GET запит для отримання всіх користувачів)
app.get("/users", (req, res) => {
  // res.send("List of users");
  console.log("=== GET ===");
  // res.status(200).json({ users });
  db.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) {
      // message - повідомлення, отримане з бази даних
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

// *** GET by ID **************************************************************
// Get a single user by id
app.get("/users/:id", (req, res) => {
  console.log(`=== GET (by id) ===`);
  const { id } = req.params;
  db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    console.log(row);
    res.json(row);
  });
});

// *** POST *******************************************************************
// POST request for creating a new user (POST запит на створення нового користувача)
app.post("/users", (req, res) => {
  console.log("=== POST ===");
  // Сервер очікує отримання id, name, email, які дивимося в тілі запиту req.body
  const { name, email } = req.body;
  // console.log(users[id], name, email);
  // Додаємо до нашого об'єкта дані (використовуємо захист sql-ін'єкцію проти атак)
  // run(запит; масив значень, які ми вставляємо замість ?; функція, яка запускається з запитом)
  db.run(
    `INSERT INTO users (name, email) VALUES (?, ?)`,
    [name, email],
    function (err) {
      if (err) {
        // message - повідомлення, отримане з бази даних
        return res.status(400).json({ error: err.message });
      }
      // Function Declaration – функция, об'явлена в основному потоці коду (класика).
      // Function Expression – об'явлення функції в контексті виразу, наприклад присвоювання ().
      // !!! Для коректної роботи 'this', - функція не повинна бути стрілочною.
      console.log({ id: this.lastID });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// *** PUT ********************************************************************
// Update a user's information
app.put("/users/:id", (req, res) => {
  console.log("PUT");
  const { id } = req.params;
  const { name, email } = req.body;

  db.run(
    `UPDATE users SET name = ?, email = ? WHERE id = ?`,
    [name, email, id],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ message: `Row updated: ${this.changes}` });
    }
  );
});

// *** DELETE *****************************************************************
// Delete a user
app.delete("/users/:id", (req, res) => {
  console.log(`=== DELETE ===`);
  const { id } = req.params;
  db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: `Row deleted: ${this.changes}` });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
