import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to authenticate user", async () => {
    await createUserUseCase.execute({
      name: "Eduardo Oliveira",
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    const response = await authenticateUserUseCase.execute({
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    expect(response).toHaveProperty("token");
  });

  it("should not be able to authenticate an user with an inexistent e-mail", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Eduardo Oliveira",
        email: "eduardo@rocketseat.com",
        password: "12345"
      });
  
      await authenticateUserUseCase.execute({
        email: "ana@rocketseat.com",
        password: "12345"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate an user with a wrong password", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Eduardo Oliveira",
        email: "eduardo@rocketseat.com",
        password: "12345"
      });
  
      await authenticateUserUseCase.execute({
        email: "eduardo@rocketseat.com",
        password: "wrong_password"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});