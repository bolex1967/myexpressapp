const app = require("../app");
const { PrismaClient } = require("@prisma/client");
// const { PrismaClient } = require("@prisma/client/extension");
const request = require("supertest");

// Ініціалізуємо клієнта Prisma для доступу до бази даних
const prisma = new PrismaClient();

// Створимо масив користувачів, який буде добавлено в базу даних
const users = [
  { email: "test1@example.com", name: "Test User 1" },
  { email: "test2@example.com", name: "Test User 2" },
  { email: "test3@example.com", name: "Test User 3" },
  { email: "test4@example.com", name: "Test User 4" },
];

describe("GET /users", () => {
  // Перед кожним тестом буде запускатися функція,
  // яка буде створювати базу даних 4-х користувачів з масиву `users`
  beforeAll(async () => {
    for (const user of users) {
      await prisma.user.create({
        data: user,
      });
    }
  });

  // Після закінчення кожного тесту чистимо нашу базу даних, видаливши всіх користувачів
  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect(); // відключаємся від бази даних
  });

  // Тест №1. Викликаємо список всіх користувачів
  test("Should respond with a list of users", async () => {
    const response = await request(app).get("/users");
    // Моделюємо API-запит до нашого API з очікуванням, що цей енд-поінт буде щось відповідати (наприклад код 200)
    expect(response.statusCode).toBe(200);
    // Очікуємо, що response.body повинен бути масив Array
    expect(response.body).toBeInstanceOf(Array);
    // Очікуємо побачити користувачів більше 0
    expect(response.body.length).toBeGreaterThan(0);
    // або точніше
    expect(response.body.length).toBe(3); // бо у нас ліміт = 3
  });

  // Перевіримо пагінацію
  test("Should paginate the results", async () => {
    // Робимо запит до нашого API
    const response = await request(app).get("/users?page=2&limit=2");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  // Перевіримо, що наш додаток не падає, при введенні некоректних даних
  test("Should handle invalid page and limit parameters", async () => {
    const response = await request(app).get("/users?page=-1&limit=abc");
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
