import * as TaxableEventsService from '../../src/services/compute/taxableEvents.compute.service'
import { TransactionKind } from '../../src/types/custom'

jest.mock('../../src/services/integrations/coingecko.service', () => ({
  ...jest.requireActual('../../src/services/integrations/coingecko.service'),
  fetchCoinPriceByCoinSymbol: async (coinSymbol: string, date: Date, currency: string) => 1
}))

describe('Taxable events', () => {
  test('calculateTaxableEvents', async () => {
    const transactions = [
      {
        id: '1',
        date: new Date('2021-01-01'),
        kind: TransactionKind.DEPOSIT,
        buyAmount: 1000,
        buyCurrency: 'usd',
        sellAmount: null,
        sellCurrency: null,
        feeAmount: null,
        feeCurrency: null
      },
      {
        id: '2',
        date: new Date('2021-01-02'),
        kind: TransactionKind.TRADE,
        buyAmount: 5,
        buyCurrency: 'eth',
        sellAmount: 500,
        sellCurrency: 'usd',
        feeAmount: 4,
        feeCurrency: 'usd'
      },
      {
        id: '3',
        date: new Date('2021-01-03'),
        kind: TransactionKind.TRADE,
        buyAmount: 1000,
        buyCurrency: 'usd',
        sellAmount: 4.9,
        sellCurrency: 'eth',
        feeAmount: 0.1,
        feeCurrency: 'eth'
      }
    ]
    const c1 = await TaxableEventsService.calculateTaxableEvents(transactions, 'nok')
    expect(c1.taxableEvents).toEqual([
      {
        buyAmount: 5,
        buyCurrency: 'eth',
        costBasis: 504,
        date: new Date('2021-01-02'),
        feeAmount: 4,
        feeCurrency: 'usd',
        gainOrLoss: 0,
        id: '2',
        kind: 'Trade',
        sellAmount: 500,
        sellCurrency: 'usd',
        taxCurrency: 'nok'
      },
      {
        buyAmount: 1000,
        buyCurrency: 'usd',
        costBasis: 5,
        date: new Date('2021-01-03'),
        feeAmount: 0.1,
        feeCurrency: 'eth',
        gainOrLoss: 995,
        id: '3',
        kind: 'Trade',
        sellAmount: 4.9,
        sellCurrency: 'eth',
        taxCurrency: 'nok'
      }
    ])
  })
})
