import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
  });

  it("should be able to show user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "Eduardo Oliveira",
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    const response = await showUserProfileUseCase.execute(user.id);

    expect(response).toHaveProperty("id");
    expect(response.name).toEqual("Eduardo Oliveira");
  });

  it("should be able to show user profile", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("wrong_user_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});