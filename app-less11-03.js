// app-less11-03.js
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Налаштування сесій
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // !!! --> secure: true потребує HTTPS
  })
);
// Віртуальна база даних користувачів
const users = [
  {
    username: "Alex",
    password: "$2b$10$LnMlFb5deyMj5OK3u14d9ehienh0orrV12iHhDOlV9/F4od7Gx88q", // хеш пароля 'Alex'
  },
];
// Обробка POST-запиту на маршрут "/login"
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // Пошук користувача в віртуальній базі даних
  const user = users.find((u) => u.username === username);
  // Якщо користувач не знайдений, повертаємо статус 401 і повідомлення
  if (!user) {
    return res.status(401).send("No user found");
  }
  // Перевірка пароля за допомогою bcrypt
  const isValid = await bcrypt.compare(password, user.password);
  // Якщо пароль не валідний, повертаємо статус 401 і повідомлення
  if (!isValid) {
    return res.status(401).send("Invalid password");
  }
  // Якщо авторизація успішна, зберігаємо ім'я користувача в сеансі
  req.session.username = user.username;
  res.status(200).send(`Welcome, ${user.username}`);
});
// Запуск сервера на порту 3000
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
