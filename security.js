const jwt = require("jsonwebtoken");

// Функція, яка генерує токен
function generateToken(user) {
  console.log("=== generateToken ===");
  // Створюємо peyload
  const payload = {
    userId: user.id,
    username: user.name,
  };

  console.log("---> payload", payload);

  // Отримуємо секретну фразу (secret) з середовища змінних
  const secret = process.env.JWT_SECRET;
  console.log("---> secret", secret);

  // Надамо термін дії токена
  const options = { expiresIn: "1h" }; // на одну годину роботи токена
  console.log("---> options", options);

  // створюємо токен
  const token = jwt.sign(payload, secret, options);
  console.log("---> token", token);

  // Повертаємо токен, який ми створили.
  return token;
}

// Функція, яка перевіряє токен
function verifyToken(token) {
  // отримаємо секрет
  const secret = process.env.JWT_SECRET;
  try {
    // Використовуємо функцію jwt.verify для перевірки JWT токена
    // з використанням того-ж секретного ключа, який використовувався
    // для його генерації
    const decoded = jwt.verify(token, secret);
    return decoded; // якщо токен дійсний, буде повернуто payload
  } catch (err) {
    return null;
  }
}

// Middleware to authenticate and verify JWT token
// middleware, який ми будемо використовувати для перевірки токенів на будь-яких ендпоінтах
function authenticateToken(req, res, next) {
  console.log("=== authenticateToken ===");

  // Retrieve the token from the Authorization header
  const authHeader = req.headers["authorization"];
  // console.log("---> req.header", req.header);
  console.log("---> authHeader", authHeader);

  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).send({ error: "No token provided" }); // нема токена
  }

  // Verify the token
  const decoded = verifyToken(token);
  if (decoded == null) {
    return res.status(403).send({ error: "Failed to authenticate token" });
  }

  // Attach the user details to the request object
  req.user = decoded;

  // Continue to the next middleware function
  next();
}

module.exports = {
  authenticateToken,
  generateToken,
};
