import { app } from "../../../../app";
import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("12345", 8);

    await connection.query(`
      INSERT INTO USERS (id, name, email, password, created_at, updated_at)
      VALUES ('${id}', 'Eduardo Oliveira', 'eduardo@rocketseat.com', '${password}', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate an user with inexistent e-mail", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "12345"
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate an user with wrong password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "eduardo@rocketseat.com",
      password: "wrong_password"
    });

    expect(response.status).toBe(401);
  });
});