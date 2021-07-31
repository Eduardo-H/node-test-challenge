import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let user_id: string;

describe("Create Statement", () => {
  beforeEach(async () => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
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

  it("should be able to create a deposit statement", async () => {
    const statement = await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 1500,
      description: "Payroll"
    });

    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual("deposit");

    const { balance } = await statementsRepositoryInMemory.getUserBalance({ user_id });

    expect(balance).toBe(1500);
  });

  it("should be able to create a withdraw statement", async () => {
    await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 1500,
      description: "Payroll"
    });

    const statement = await createStatementUseCase.execute({
      user_id,
      type: OperationType.WITHDRAW,
      amount: 200,
      description: "Fancy dinner"
    });

    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual("withdraw");

    const { balance } = await statementsRepositoryInMemory.getUserBalance({ user_id });

    expect(balance).toBe(1300);
  });

  it("should not be able to create statement of an nonexistent user", () => {
    expect(async () => {  
      await createStatementUseCase.execute({
        user_id: "fake_user_id",
        type: OperationType.DEPOSIT,
        amount: 1500,
        description: "Payroll"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to withdraw amount gratter than the user's balance", async () => {
    expect(async () => {  
      await createStatementUseCase.execute({
        user_id,
        type: OperationType.WITHDRAW,
        amount: 2000,
        description: "Fancy dinner"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  }); 
});