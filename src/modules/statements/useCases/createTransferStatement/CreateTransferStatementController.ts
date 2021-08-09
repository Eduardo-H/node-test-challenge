import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

class CreateTransferStatementController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;
    const { reciever_id } = request.params;

    const createTransferStatementUseCase = container.resolve(CreateTransferStatementUseCase);

    const statement = await createTransferStatementUseCase.execute({
      sender_id,
      reciever_id,
      amount,
      description
    });

    return response.status(201).json(statement);
  }
}

export { CreateTransferStatementController };