// app-less10-02.js
// Less. 10-02
/** Напишіть код на Express.js для створення сервера,
 * який має два маршрути: головна сторінка, що відображає
 * "Welcome to my Express App!" та маршрут "/contact",
 * що відображає контактну інформацію, наприклад
 * "Contact us at: contact@example.com".*/

// Замість ES6 будемо використовувати CommonJS

const express = require("express");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Welcome to my Express App!");
});

app.get("/contact", (req, res) => {
  res.send("Contact us at: contact@example.com");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
