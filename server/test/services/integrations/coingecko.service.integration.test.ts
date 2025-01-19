import * as CoingeckoService from '../../../src/services/integrations/coingecko.integration.service'

describe('fetch coins', () => {
  test('fetch price of LINK', async () => {
    const price = await CoingeckoService.fetchCoinPriceByCoinSymbol('LINK', new Date(2020, 12, 1), 'usd')
    expect(price).toBeDefined()
    expect(price).toStrictEqual(11.25321828571232)
  })
})
