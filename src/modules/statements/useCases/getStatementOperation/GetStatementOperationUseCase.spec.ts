import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let user_id: string;

describe("Get Statement Operation", () => {
  beforeEach(async () => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
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

  it("should be able to get a statement operation", async () => {
    const depositStatement = await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 1500,
      description: "Payroll"
    });

    const statement = await getStatementOperationUseCase.execute({ 
      user_id, 
      statement_id: depositStatement.id 
    });

    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual("deposit");
    expect(statement.amount).toBe(1500);
    expect(statement.user_id).toEqual(user_id);
  });

  it("should not be able to get a statement of an nonexistent user", async () => {
    const depositStatement = await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 1500,
      description: "Payroll"
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({ 
        user_id: "fake_user_id", 
        statement_id: depositStatement.id
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get an nonexistent statement", async () => {
    expect(async () => {  
      await getStatementOperationUseCase.execute({ 
        user_id, 
        statement_id: "fake_statement_id"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
})