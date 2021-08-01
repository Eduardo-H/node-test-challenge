import { app } from "../../../../app";
import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import createConnection from "../../../../database";
import { OperationType } from "@modules/statements/entities/Statement";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
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

  it("should be able to get a statement operation", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    const { token } = responseToken.body;
    const { id } = responseToken.body.user;

    const statementResponse = await request(app)
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

    const response = await request(app)
      .get(`/api/v1/statements/${statementResponse.body.id}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(200);
  });

  it("should not be able to get a nonexistent statement operation", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get(`/api/v1/statements/${uuidV4()}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(404);
  });

  it("should not be able to get statement operation an nonexistent user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    const { token } = responseToken.body;
    const { id } = responseToken.body.user;

    const statementResponse = await request(app)
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

    const response = await request(app)
      .get(`/api/v1/statements/${statementResponse.body.id}`)
      .set({
        Authorization: `Bearer fake_token`
      });

    expect(response.status).toBe(401);
  });
});