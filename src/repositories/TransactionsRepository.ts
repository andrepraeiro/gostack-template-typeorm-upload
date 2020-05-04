import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const balance = { income: 0, outcome: 0, total: 0 };
    const transactions = await this.find();
    balance.income = transactions.reduce(
      (totalIncome = 0, currentTransaction) => {
        return currentTransaction.type === 'income'
          ? totalIncome + currentTransaction.value
          : totalIncome;
      },
      0,
    );

    balance.outcome = transactions.reduce(
      (totalOutcome = 0, currentTransaction) => {
        return currentTransaction.type === 'outcome'
          ? totalOutcome + currentTransaction.value
          : totalOutcome;
      },
      0,
    );

    balance.total = balance.income - balance.outcome;
    return balance;
  }
}

export default TransactionsRepository;
