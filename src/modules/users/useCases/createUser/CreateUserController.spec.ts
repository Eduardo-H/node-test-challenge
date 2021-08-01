import { Connection } from "typeorm";
import { app } from "../../../../app";
import request from "supertest";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create an user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Eduardo Oliveira",
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a repeated user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Eduardo Júnior",
      email: "eduardo@rocketseat.com",
      password: "54321"
    });
    
    expect(response.status).toBe(400);
  });
});