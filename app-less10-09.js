/** Практичне питання, що вимагає написання коду:
 * Напишіть фрагмент коду, який демонструє використання
 * кешування для зменшення навантаження на базу даних.
 * Ви можете використовувати будь-яку мову програмування. */

/** Застосуємо самий простий варіант кешування - кешування
 *  в пам'яті (In-Memory Caching), яке не вимагає
 *  встановлення додаткових розширень. */

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`Method: ${req.method}, Path: ${req.url}`);
  next();
});

const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

app.use(requestLogger);

const userSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
});
 
// Вбудований кеш
const cache = {}; // Створюємо об'єкт для зберігання кешованих даних

const cacheMiddleware = (req, res, next) => {
  const { id } = req.params;
  
  // Перевіримо, чи є дані в кеші
  if (cache[id]) {
    // повертаємо кешовані дані
    console.log(`Serving from cache: ${id}`);
    res.json(cache[id]);
  } else {
    next(); // Даних нема. Передаємо контроль наступному middleware
  }
};

// GET all users **************************************************************
app.get("/users", async (req, res) => {
  console.log(req.query);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 3;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const users = await prisma.user.findMany(); // Отримуємо всіх користувачів з бази даних
    const usersSlice = users.slice(startIndex, endIndex); // Отримуємо користувачів для поточної сторінки
    res.json(usersSlice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single user by id ****************************************************
app.get("/users/:id", cacheMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (user) {
      cache[id] = user; // Зберігаємо отримані дані в кеші
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST request for creating a new user ***************************************
app.post("/users", async (req, res) => {
  const userData = req.body;
  const { value, error } = userSchema.validate(userData);
  if (error) {
    return res.status(400).json(`Error: ${error.message}`);
  }
  const { name, email } = value;
  try {
    const user = await prisma.user.create({
      data: { name, email },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a user's information ************************************************
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  console.log(req.body);
  try {
    const user = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: { name, email },
    });
    cache[id] = user; // Оновлюємо кеш після оновлення даних користувача
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a user **************************************************************
app.delete("/users/:id", async (req, res) => {
  console.log(`Delete: ${req.body.name}, ${req.body.email}`);
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });
    delete cache[id]; // Видаляємо дані з кешу після видалення користувача
    console.log(`User id = ${id} (${req.body.name}) - deleted`);
    res.json({ message: `User (id: ${id}, name: ${req.body.name}) deleted` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}

module.exports = app;
