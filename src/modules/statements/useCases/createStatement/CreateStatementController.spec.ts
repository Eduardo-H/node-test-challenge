import { app } from "../../../../app";
import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import createConnection from "../../../../database";
import { OperationType } from "@modules/statements/entities/Statement";

let connection: Connection;

describe("Create Statement Controller", () => {
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

  it("should be able to create a deposit statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    const { token } = responseToken.body;
    const { id } = responseToken.body.user;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        user_id: id,
        type: OperationType.DEPOSIT,
        amount: 500,
        description: "Freelance"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toEqual("deposit");
  });

  it("should be able to create a withdraw statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    const { token } = responseToken.body;
    const { id } = responseToken.body.user;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        user_id: id,
        type: OperationType.WITHDRAW,
        amount: 300,
        description: "Plumber"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toEqual("withdraw");
  });

  it("should not be able to create statement of an nonexistent user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        user_id: "fake_id",
        type: OperationType.WITHDRAW,
        amount: 500,
        description: "Plumber"
      })

    expect(response.status).toBe(401);
  });

  it("should not be able to withdraw amount gratter than the user's balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    const { token } = responseToken.body;
    const { id } = responseToken.body.user;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        user_id: id,
        type: OperationType.WITHDRAW,
        amount: 800,
        description: "Used car"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(400);
  });
});