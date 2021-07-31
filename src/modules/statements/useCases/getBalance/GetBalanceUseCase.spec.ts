import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let user_id: string;

describe("Get Balance", () => {
  beforeEach(async () => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );

    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

    const { id } = await createUserUseCase.execute({
      name: "Eduardo Oliveira",
      email: "eduardo@rocketseat.com",
      password: "12345"
    });

    user_id = id;
  });

  it("should be able to get the user's balance", async () => {
    const response = await getBalanceUseCase.execute({ user_id });

    expect(response.balance).toBe(0);
    expect(response).toHaveProperty("statement");
    expect(response.statement.length).toBe(0);
  });

  it("should be able to get the user's balance after a deposit", async () => {
    await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 1500,
      description: "Payroll"
    });

    await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "New Year's Bonus"
    });

    const response = await getBalanceUseCase.execute({ user_id });

    expect(response.balance).toBe(2000);
    expect(response.statement.length).toBe(2);
  });

  it("should be able to get the user's balance after a withdraw", async () => {
    await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 1500,
      description: "Payroll"
    });

    await createStatementUseCase.execute({
      user_id,
      type: OperationType.WITHDRAW,
      amount: 700,
      description: "Car Mechanic"
    });

    const response = await getBalanceUseCase.execute({ user_id });

    expect(response.balance).toBe(800);
    expect(response.statement.length).toBe(2);
  });

  it("should not be able to get the balance of an nonexistent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "fake_user_id" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});