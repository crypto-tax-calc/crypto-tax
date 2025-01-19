import * as InventoryService from './inventory.compute.service'
import { type Inventory, type InventoryEntry } from './inventory.compute.service'
import { type TaxableEvent, type Transaction, TransactionKind } from '../../types/custom'
import * as CoingeckoService from '../integrations/coingecko.integration.service'
import { logger } from '../../config/logger'

const ignoredCurrencies = ['usd']

const calculateCostBasisForTradeRecursive = async (entries: InventoryEntry[], transactionCurrency: string, taxCurrency: string, amountLeft: number, costBasis: number = 0): Promise<number> => {
  if (amountLeft < 0) {
    logger.error(`Amount left is less than 0: ${amountLeft} ${transactionCurrency}`)
    return costBasis
  }

  const [entry, ...rest] = entries

  if (!entry) {
    logger.error(`Missing inventory entry to subtract for ${amountLeft} ${transactionCurrency}`)
    return costBasis
  }

  if (amountLeft === 0) {
    return costBasis
  }

  const unitCost = await CoingeckoService.fetchCoinPriceByCoinSymbol(transactionCurrency, entry.date, taxCurrency)

  const newCostBasis = costBasis + amountLeft * (unitCost ?? 0)
  const newAmountLeft = amountLeft - entry.amount

  return await calculateCostBasisForTradeRecursive(rest, transactionCurrency, taxCurrency, newAmountLeft, newCostBasis)
}

const calculateCostBasisForTrade = async (inventory: Inventory, transactionCurrency: string | null, transactionAmount: number | null, taxCurrency: string): Promise<number> => {
  if (!transactionAmount || !transactionCurrency) return 0

  const entries = inventory[transactionCurrency]

  if (!entries) return 0

  const costBasis = await calculateCostBasisForTradeRecursive(entries, transactionCurrency, taxCurrency, transactionAmount)
  return costBasis
}

const calculateCostBasis = async (inventory: Inventory, transaction: Transaction, taxCurrency: string): Promise<number> => {
  if (transaction.kind !== TransactionKind.TRADE) {
    return 0
  }

  const sellCostBasis = await calculateCostBasisForTrade(inventory, transaction.sellCurrency, transaction.sellAmount, taxCurrency)
  const feeCostBasis = await calculateCostBasisForTrade(inventory, transaction.feeCurrency, transaction.feeAmount, taxCurrency)

  return sellCostBasis + feeCostBasis
}

const calculateGainOrLoss = async (transaction: Transaction, costBasis: number, taxCurrency: string): Promise<number> => {
  if (!transaction.buyCurrency || !transaction.buyAmount) return 0

  const buyUnitPrice = await CoingeckoService.fetchCoinPriceByCoinSymbol(transaction.buyCurrency, transaction.date, taxCurrency)

  const totalValue = transaction.buyAmount * (buyUnitPrice ?? 0)

  if (transaction.sellCurrency && ignoredCurrencies.includes(transaction.sellCurrency)) {
    return 0
  }

  return totalValue - costBasis
}

const calculateTaxableEvent = async (inventory: Inventory, transaction: Transaction, taxCurrency: string): Promise<TaxableEvent | null> => {
  if (transaction.kind === TransactionKind.DEPOSIT || transaction.kind === TransactionKind.WITHDRAWAL) return null

  const costBasis = await calculateCostBasis(inventory, transaction, taxCurrency)
  const gainOrLoss = await calculateGainOrLoss(transaction, costBasis, taxCurrency)

  return {
    ...transaction,
    costBasis,
    gainOrLoss,
    taxCurrency
  }
}

export const calculateTaxableEvents = async (
  transactions: Transaction[],
  taxCurrency: string,
  inventory: Inventory = {},
  taxableEvents: TaxableEvent[] = []
): Promise<{ taxableEvents: TaxableEvent[]; inventory: Inventory }> => {
  const [transaction, ...restTransactions] = transactions

  if (!transaction) {
    return { taxableEvents, inventory }
  }

  const taxableEvent = await calculateTaxableEvent(inventory, transaction, taxCurrency)
  const newTaxableEvents = taxableEvent ? [...taxableEvents, taxableEvent] : taxableEvents
  const newInventory = InventoryService.calculateNewInventory(inventory, transaction)

  return await calculateTaxableEvents(restTransactions, taxCurrency, newInventory, newTaxableEvents)
}
