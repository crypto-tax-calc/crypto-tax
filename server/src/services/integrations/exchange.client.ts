import { type Transaction } from '@prisma/client'

export type Transaction = {
  id: string
  date: Date
  kind: TransactionKind
  buyAmount: number | null
  buyCurrency: string | null
  sellAmount: number | null
  sellCurrency: string | null
  feeAmount: number | null
  feeCurrency: string | null
  createdAt: Date
  updatedAt: Date
  userId: string
}

abstract class ExchangeClient {
  keys: {
    apiKey: string
    apiSecret: string
  }
  minStartDate: Date | null
  maxSize: number | null
  maxDays: number | null

  constructor(keys: { apiKey: string; apiSecret: string }) {
    this.keys = keys
  }

  abstract getFills(): Promise<Transaction[]>

  abstract getDeposits(): Promise<Transaction[]>

  abstract getWithdrawals(): Promise<Transaction[]>
}
