import { TransactionKind } from '../../src/types/custom'
import * as InventoryService from '../../src/services/compute/inventory.compute.service'

describe('Inventory', () => {
  test('calculateNewInventory', () => {
    const t1 = {
      id: '1',
      date: new Date('2021-01-02'),
      kind: TransactionKind.TRADE,
      buyAmount: 1,
      buyCurrency: 'BTC',
      sellAmount: 100,
      sellCurrency: 'USD',
      feeAmount: 0.01,
      feeCurrency: 'USD'
    }

    const inventory1 = InventoryService.calculateNewInventory({}, t1)
    expect(inventory1).toEqual({
      BTC: [{ amount: 1, date: new Date('2021-01-02') }]
    })

    const t2 = {
      ...t1,
      id: '2',
      date: new Date('2021-01-03'),
      buyAmount: 1,
      buyCurrency: 'BTC',
      sellAmount: 100,
      sellCurrency: 'USD',
      feeAmount: 0.01,
      feeCurrency: 'USD'
    }

    const inventory2 = InventoryService.calculateNewInventory(inventory1, t2)
    expect(inventory2).toEqual({
      BTC: [
        { amount: 1, date: new Date('2021-01-02') },
        { amount: 1, date: new Date('2021-01-03') }
      ]
    })

    const t3 = {
      ...t1,
      id: '3',
      date: new Date('2021-01-04'),
      buyAmount: 2,
      buyCurrency: 'ETH',
      sellAmount: 100,
      sellCurrency: 'USD',
      feeAmount: 0.01,
      feeCurrency: 'USD'
    }

    const inventory3 = InventoryService.calculateNewInventory(inventory2, t3)
    expect(inventory3).toEqual({
      BTC: [
        { amount: 1, date: new Date('2021-01-02') },
        { amount: 1, date: new Date('2021-01-03') }
      ],
      ETH: [{ amount: 2, date: new Date('2021-01-04') }]
    })

    const t4 = {
      ...t1,
      id: '4',
      date: new Date('2021-01-05'),
      buyAmount: 200,
      buyCurrency: 'USD',
      sellAmount: 1.5,
      sellCurrency: 'BTC',
      feeAmount: 0.01,
      feeCurrency: 'BTC'
    }

    const inventory4 = InventoryService.calculateNewInventory(inventory3, t4)
    expect(inventory4).toEqual({
      BTC: [{ amount: 0.49, date: new Date('2021-01-03') }],
      ETH: [{ amount: 2, date: new Date('2021-01-04') }],
      USD: [{ amount: 200, date: new Date('2021-01-05') }]
    })

    const t5 = {
      ...t1,
      id: '5',
      date: new Date('2021-01-06'),
      buyAmount: 200,
      buyCurrency: 'USD',
      sellAmount: 2,
      sellCurrency: 'ETH',
      feeAmount: 0.01,
      feeCurrency: 'ETH'
    }

    const inventory5 = InventoryService.calculateNewInventory(inventory4, t5)
    expect(inventory5).toEqual({
      BTC: [{ amount: 0.49, date: new Date('2021-01-03') }],
      ETH: [],
      USD: [
        { amount: 200, date: new Date('2021-01-05') },
        { amount: 200, date: new Date('2021-01-06') }
      ]
    })
  })
})
