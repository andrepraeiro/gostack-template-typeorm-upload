import cvsParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface Line {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  private readFile(filePath: string): Promise<Line[]> {
    return new Promise((resolve, reject) => {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      cvsParse(
        fileContent,
        { trim: true, columns: true },
        (err, transactions: Line[]) => {
          if (err) reject(err);
          else resolve(transactions);
        },
      );
    });
  }

  async execute(file: Express.Multer.File): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, file.filename);
    const Lines = await this.readFile(filePath);
    const transactions = Promise.all(
      Lines.map(async ({ title, type, value, category }) => {
        const createTransaction = new CreateTransactionService();
        const transaction = await createTransaction.execute({
          title,
          type,
          value,
          category_title: category,
        });
        return transaction;
      }),
    );
    return transactions;
  }
}

export default ImportTransactionsService;
