// Замість ES6 будемо використовувати CommonJS

const express = require("express");

const app = express();
const port = 3000;

// Читаємо всіх користувачів
app.get("/users", (req, res) => {
  res.send("List of users");
});

// Читаємо дані окремого користувача
app.get("/users/:id", (req, res) => {
  res.send("A specific user");
});

// Створюємо нового користувача
app.post("/users", (req, res) => {
  res.send("Users created successfully");
});

// Змінюємо дані окремого користувача
app.put("/users/:id", (req, res) => {
  res.send("This user was updated successfully");
});

// Видаляємо окремого користувача
app.delete("/users/:id", (req, res) => {
  res.send("User deleted successfully");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
