import { Transaction } from '@prisma/client'
import * as TransactionsDao from '../daos/transactions.dao'

export const fetch = (userId: string): Promise<Transaction> => {
  return await TransactionsDao.fetch(userId)
}
