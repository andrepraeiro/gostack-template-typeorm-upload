import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import CreateCategoryService from './CreateCategoryService';
import CategoriesRepository from '../repositories/CategoriesRepository';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_title,
  }: Request): Promise<Transaction> {
    const categoryRepository = getCustomRepository(CategoriesRepository);
    const existCategory = await categoryRepository.findByTitle(category_title);

    if (!existCategory) {
      const createCategory = new CreateCategoryService();
      await createCategory.execute({
        title: category_title,
      });
    }

    const category = await categoryRepository.findByTitle(category_title);

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Outcome value is greater than total balance');
    }
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: category?.id,
    });

    return transactionRepository.save(transaction);
  }
}

export default CreateTransactionService;
