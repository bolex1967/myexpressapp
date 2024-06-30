// Rest API
// Замість ES6 будемо використовувати CommonJS

const express = require("express");
// const sqlite3 = require("sqlite3");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const port = 3000;

// Used Middleware to parse JSON bodies
app.use(express.json());

// A middleware that runs for every request
// Напишемо функцію, яка буде спрацьовувати при кожному запиті.
app.use((req, res, next) => {
  console.log("This is middleware");
  // console.log(req);
  console.log(req.url, req.method);
  next();
});

// Middleware для логування методу і шляху запиту
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next(); // Передаємо контроль наступному middleware
};

// Використання middleware у додатку
app.use(requestLogger);

// GET all users **************************************************************
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single user by id ****************************************************
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (user) {
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
  // Сервер очікує отримання id, name, email, які дивимося в тілі запиту req.body
  const { name, email } = req.body;

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
    console.log(`User id = ${id} (${req.body.name}) - deleted`);
    res.json({ message: `User (id: ${id}, name: ${req.body.name}) deleted` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listening port *************************************************************
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
