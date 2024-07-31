const jwt = require("jsonwebtoken");

// Функція, яка генерує токен
function generateToken(user) {
  // Створюємо peyload
  const payload = {
    userId: user.id,
    username: user.name,
  };

  // робимо токен (secret)
  const secret = process.env.JWT_SECRET;
  // Надамо термін дії
  const options = { expiresIn: "1h" }; // на одну годину роботи токена
  // створюємо токен
  const token = jwt.sign(payload, secret, options);
  // Повертаємо токен, який ми створили.
  return token;
}

// Функція перевірки токену
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

// middleware, який ми будемо використовувати для перевірки токенів на будь-яких ендпоінтах
function authenticateToken(req, res, next) {
  const authHeader = req.header["authorization"];
  console.log(`function authenticateToken, authHeader", ${authHeader}`);

  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).send({ error: "No token provided" }); // нема токена
  }
  const decoded = verifyToken(token);
  if (decoded == null) {
    return res.status(403).send({ error: "Failed to authenticate token" });
  }

  req.user = decoded;

  next();
}

module.exports = {
  authenticateToken,
  generateToken,
};
