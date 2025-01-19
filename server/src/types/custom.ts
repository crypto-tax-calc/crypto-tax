export interface TaxableEvent extends Transaction {
  costBasis: number
  gainOrLoss: number
  taxCurrency: string
}
