// Rest API
// Замість ES6 будемо використовувати CommonJS

const express = require("express");
// const sqlite3 = require("sqlite3");
const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");

const prisma = new PrismaClient();
const app = express();
const port = 3000;

// Used Middleware to parse JSON bodies
app.use(express.json());

// A middleware that runs for every request
// Напишемо функцію, яка буде спрацьовувати при кожному запиті.
app.use((req, res, next) => {
  // console.log("This is middleware");
  // console.log(req);
  console.log(`Method: ${req.method}, Path: ${req.url}`);
  next();
});

// Middleware для логування методу і шляху запиту
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next(); // Передаємо контроль наступному middleware
};

// Використання middleware у додатку
app.use(requestLogger);

// Використовуємо метод Joi.object() для створення схеми для даних, які нам потрібно перевіряти.
const userSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
});

// GET all users **************************************************************
app.get("/users", async (req, res) => {
  console.log(req.query);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 3;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Assuming 'resources' is our dataset

  try {
    const users = await prisma.user.findMany(); // All users
    const usersSlice = users.slice(startIndex, endIndex);
    res.json(usersSlice);
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
  // Get the request body
  // Сервер очікує отримання id, name, email, які дивимося в тілі запиту req.body
  const userData = req.body;
  // Validate the request body using the user schema
  // Destructuring value, error
  const { value, error } = userSchema.validate(userData);
  // Check if there is a validation error
  if (error) {
    // Return a 400 status code and the error message
    return res.status(400).json(`Error: ${error.message}`);
  }
  // If there is no error, proceed with the rest of the logic
  const { name, email } = value;

  // Create a new user in the database and return

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
