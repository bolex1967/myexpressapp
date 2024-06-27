/** Практичне питання, що вимагає написання коду:
 * Напишіть фрагмент коду на Express.js, який реалізує GET запит
 * для отримання даних про конкретного користувача за його ID.
 * Запит повинен повертати статус 200 та дані користувача у форматі
 * JSON, якщо користувач знайдений, або статус 404 з повідомленням
 * про помилку, якщо користувача не існує. (українською) */
// Замість ES6 будемо використовувати CommonJS

const express = require("express");
const app = express();
const port = 3000;

// Used Middleware to parse JSON bodies
app.use(express.json());

// In-memory "database" for demonstration purposes («База даних» у пам’яті для демонстраційних цілей.)
let users = {};

// GET request for fetching all users (GET запит для отримання всіх користувачів)
app.get("/users", (req, res) => {
  // res.send("List of users");
  console.log("GET");
  res.status(200).json({ users });
});

// Читаємо дані окремого користувача
app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  const user = users[id];

  if (!user) {
    res.status(404).json({ error: "Користувач не знайдений" });
    return;
  }
  res.status(200).json({ user: users[id] });
});

// POST request for creating a new user (POST запит на створення нового користувача)
app.post("/users", (req, res) => {
  // Сервер очікує отримання id, name, email, які дивимося в тілі запиту req.body
  const { id, name, email } = req.body;
  console.log(users[id]);
  console.log(id, name, email);

  if (users[id]) {
    res.status(409).json({ error: "User already exists" });
    // return;
  } else {
    // Додаємо до нашого об'єкта дані
    users[id] = { name, email };
    // res.send(`${id}, name, email`);
    // res.status(201);
    res.status(201).json({ user: users[id] });
  }
});

// Змінюємо дані окремого користувача
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const user = users[id];

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  users[id] = { name, email };
  res.status(200).json({ user: users[id] });
});

// Видаляємо окремого користувача
app.delete("/users/:id", (req, res) => {
  console.log(`=== DELETE ===`);
  const { id } = req.params;
  console.log(id);
  const user = users[id];
  // console.log(`GET. ID = ${users[id]} `);
  // res.send("A specific user");
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  delete users[id];
  res.status(200).json({ message: `User id: ${id} deleted successfully` });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
