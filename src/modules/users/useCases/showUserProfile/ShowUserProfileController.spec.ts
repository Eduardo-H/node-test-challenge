import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;

describe("Show User Profiler Controller", () => {
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

  it("should be able to show user profile", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toEqual("eduardo@rocketseat.com");
    expect(response.body.name).toEqual("Eduardo Oliveira");
  });

  it("should not be able to show user profile without being authenticated", async () => {
    const response = await request(app)
      .get("/api/v1/profile")

    expect(response.status).toBe(401);
  });
});