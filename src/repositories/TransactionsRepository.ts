import { EntityRepository, Repository, getConnection } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionSum {
  type: string;
  sum: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionSums: TransactionSum[] = await getConnection()
      .createQueryBuilder()
      .select('t.type', 'type')
      .addSelect('sum(t.value)', 'sum')
      .from(Transaction, 't')
      .groupBy('t.type')
      .getRawMany();

    const income =
      transactionSums.find(item => item.type === 'income')?.sum || 0;
    const outcome =
      transactionSums.find(item => item.type === 'outcome')?.sum || 0;
    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
