import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  })

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Eduardo Oliveira",
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    expect(user).toHaveProperty("id");
    expect(user.email).toEqual("eduardo@rocketseat.com");
  });

  it("should not be able to create a user with a repeated e-mail", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Eduardo Oliveira",
        email: "eduardo@rocketseat.com",
        password: "12345"
      });

      await createUserUseCase.execute({
        name: "Eduardo Souza",
        email: "eduardo@rocketseat.com",
        password: "54321"
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});