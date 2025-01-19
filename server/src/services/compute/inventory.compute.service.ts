import { logger } from '../../config/logger'
import { type Transaction } from '../../types/custom'

export interface InventoryEntry {
  amount: number
  date: Date
}

export type Inventory = Record<string, InventoryEntry[]>

const addToInventory = (inventory: Inventory, transactionCurrency: string | null, transactionAmount: number | null, date: Date): Inventory => {
  if (!transactionAmount || !transactionCurrency) return inventory

  const entry = { amount: transactionAmount, date }
  const newInventory = { ...inventory, [transactionCurrency]: [...(inventory[transactionCurrency] ?? []), entry] }
  return newInventory
}

const subtractFromInventory = (inventory: Inventory, transactionCurrency: string | null, transactionAmount: number | null): Inventory => {
  if (!transactionAmount || !transactionCurrency) return inventory

  const entries = inventory[transactionCurrency]

  if (!entries?.length) {
    logger.warn(`Missing inventory entries to subtract for ${transactionAmount} ${transactionCurrency}`)
    return inventory
  }

  const [entry, ...restEntries] = entries

  if (!entry) {
    logger.warn(`Missing inventory entry to subtract for ${transactionAmount} ${transactionCurrency}`)
    return inventory
  }

  if (entry.amount < transactionAmount) {
    const newInventory = { ...inventory, [transactionCurrency]: restEntries }
    const newAmount = transactionAmount - entry.amount
    return subtractFromInventory(newInventory, transactionCurrency, newAmount)
  }

  if (entry.amount > transactionAmount) {
    const newEntryAmount = entry.amount - transactionAmount
    const newEntry = { ...entry, amount: newEntryAmount }
    const newInventory = { ...inventory, [transactionCurrency]: [newEntry, ...restEntries] }
    return newInventory
  }

  // Amount is same as inventory entry
  const newInventory = { ...inventory, [transactionCurrency]: restEntries }
  return newInventory
}

export const calculateNewInventory = (inventory: Inventory, transaction: Transaction): Inventory => {
  const inventoryAfterBuy = addToInventory(inventory, transaction.buyCurrency, transaction.buyAmount, transaction.date)
  const inventoryAfterSell = subtractFromInventory(inventoryAfterBuy, transaction.sellCurrency, transaction.sellAmount)
  const inventoryAfterFee = subtractFromInventory(inventoryAfterSell, transaction.feeCurrency, transaction.feeAmount)

  return inventoryAfterFee
}
