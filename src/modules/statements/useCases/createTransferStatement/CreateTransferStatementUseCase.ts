import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { AppError } from "../../../../shared/errors/AppError";
import { inject, injectable } from "tsyringe";

interface IRequest {
  sender_id: string;
  reciever_id: string;
  amount: number;
  description: string;
}

@injectable()
class CreateTransferStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ 
    sender_id, 
    reciever_id, 
    amount, 
    description 
  }: IRequest): Promise<Statement> {
    const recieverUser = await this.usersRepository.findById(reciever_id);

    if (!recieverUser) {
      throw new AppError("Reciever user not found");
    }

    const senderBalance = await this.statementsRepository.getUserBalance({ user_id: sender_id});

    if (senderBalance.balance < amount) {
      throw new AppError("Insuficient funds");
    }

    const statement = await this.statementsRepository.create({
      user_id: reciever_id,
      sender_id,
      amount,
      description,
      type: OperationType.TRANSFER
    });

    return statement;
  }
}

export { CreateTransferStatementUseCase };