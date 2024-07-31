// Rest API
// Замість ES6 будемо використовувати CommonJS

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { authenticateToken, generateToken } = require("./security");

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json()); // Used Middleware to parse JSON bodies

app.use((req, res, next) => {
  // A middleware that runs for every request
  console.log(`Method: ${req.method}, Path: ${req.url}`);
  next();
});

const requestLogger = (req, res, next) => {
  // Middleware для логування методу і шляху запиту
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next(); // Передаємо контроль наступному middleware
};

app.use(requestLogger); // Використовуємо middleware у додатку

const userSchema = Joi.object({
  // Метод Joi.object() - створення схеми для даних, які нам потрібно перевіряти.
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
});

app.get("/health", (rec, res) => {
  res.status(200).send("Ok!");
});

app.get("/status", (rec, res) => {
  res.status(200).send("Сервер працює!");
});

app.get("/users", authenticateToken, async (req, res) => {
  console.log(req.query);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

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

app.get("/users/:id", authenticateToken, async (req, res) => {
  // Get a single user by id
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

/* 
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
*/

app.put("/users/:id", authenticateToken, async (req, res) => {
  // Update a user's information ************************************************
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

app.delete("/users/:id", authenticateToken, async (req, res) => {
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

app.get("/api/books", async (req, res) => {
  // GET books with pagination **************************************************
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const books = await prisma.user.findMany(); // All books
    const result = books.slice(startIndex, endIndex);
    res.json(result);
    console.log(`Page: ${page}, Limit: ${limit}`);
    console.log(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/register", async (req, res) => {
  const { name, password, email } = req.body;
  try {
    // створимо 'сіль', щоб наші хеші були різні (нестандартні),
    // використовуючи bcrypt
    const salt = await bcrypt.genSalt(10);
    // Робимо захешований пароль
    const hashedPassword = await bcrypt.hash(password, salt);
    // і зберігаємо цього користувача в нашій базі даних
    const user = await prisma.user.create({
      data: {
        name,
        hashedPassword,
        email,
      },
    });
    res.status(200).send("User was created");
  } catch (err) {
    res.status(500).send("Error while creating a user");
    // console.log(err);
  }
});

app.post("/login", async (req, res) => {
  console.log("=== /login ===");

  // Витягування email та password з тіла запиту
  const { email, password } = req.body;

  try {
    // Пошук користувача в базі даних за email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // Якщо користувач не знайдений - 401 (Unauthorized)
    if (!user) {
      return res.status(401).send("No user found");
    }

    console.log("--- User:", user);

    const isValid = await bcrypt.compare(password, user.hashedPassword); // Перевірка пароля за допомогою bcrypt

    if (!isValid) {
      return res.status(401).send("Invalid password");
    }

    token = generateToken(user); // Генеруємо токен

    // Якщо авторизація успішна, повертаємо статус 200 (OK)
    res.status(200).send({
      message: "Login successful",
      token: token,
    });
  } catch (err) {
    // У випадку помилки повертаємо статус 500 (Internal Server Error) і повідомлення про помилку
    res.status(500).send("Login error");
    // Логування помилки в консолі для відлагодження
    console.log("--- error:", err);
  }
});

app.post("/change-password", async (req, res) => {
  console.log("=== /change-password ===");
  /** Lesson 11-02. Task
   * Напишіть функцію на JavaScript для Express.js маршруту `/change-password`,
   * яка дозволить користувачам змінювати свій пароль.
   * Функція повинна приймати старий пароль, перевіряти його,
   * і якщо він вірний, оновлювати пароль на новий,
   * використовуючи хешування bcrypt.
   * У відповідь на запит поверніть повідомлення про успішну зміну паролю
   * або про помилку, якщо старий пароль не відповідає збереженому хешу. */

  // Витягування email, старого пароля і нового пароля з тіла запиту

  console.log("--- req.body", req.body);

  const { email, oldPassword, newPassword } = req.body;
  try {
    // Пошук користувача в базі даних за email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // Якщо користувач не знайдений, повертаємо статус 401 (Unauthorized) і повідомлення
    if (!user) {
      return res.status(401).send("No user found");
    }

    // Перевірка старого пароля за допомогою bcrypt
    const isValid = await bcrypt.compare(oldPassword, user.hashedPassword);

    // Якщо старий пароль не валідний, повертаємо статус 401 (Unauthorized) і повідомлення
    if (!isValid) {
      return res.status(401).send("Old password is incorrect");
    }

    // Хешування нового пароля за допомогою bcrypt
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Оновлення пароля користувача в базі даних
    await prisma.user.update({
      where: { email: email },
      data: { hashedPassword: hashedNewPassword },
    });

    // Якщо зміна пароля успішна, повертаємо статус 200 (OK) і повідомлення
    res.status(200).send("Password changed successfully");
  } catch (err) {
    // У випадку помилки повертаємо статус 500 (Internal Server Error) і повідомлення про помилку
    res.status(500).send("Password change error");

    // Логування помилки в консолі для відлагодження
    console.log(err);
  }
});

app.get("/profile", authenticateToken, async (req, res) => {
  console.log("req.user.username:", req.user.username);
  if (req.user) {
    res.send(`Hi, ${req.user.username}`);
  } else {
    res.send("Please log in");
  }
});

if (require.main === module) {
  // Listening port *************************************************************
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}

module.exports = app;
