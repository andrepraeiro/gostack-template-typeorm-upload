import cvsParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(file: Express.Multer.File): Promise<Transaction[]> {
    console.log(file);
    const filePath = path.join(uploadConfig.directory, file.filename);
    const transactions: Transaction[] = [];
    const createTransaction = new CreateTransactionService();
    fs.createReadStream(filePath)
      .on('error', () => {})

      .pipe(cvsParse())

      .on('data', async row => {
        const title = row[0].trim();
        const type = row[1].trim();
        const value = parseFloat(row[2].trim());
        const category = row[3].trim();

        const transaction = await createTransaction.execute({
          title,
          type,
          value,
          category_title: category,
        });

        transactions.push(transaction);
      })
      .on('end', () => transactions);
  }
}

export default ImportTransactionsService;
