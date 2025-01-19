import * as Request from '../../config/request'
import * as StringUtils from '../../utils/string.utils'
import { logger } from '../../config/logger'

// https://www.coingecko.com/api/documentations/v3

const baseUrl = 'https://api.coingecko.com/api/v3'

interface CoinsData {
  coins: Coin[]
}

interface Coin {
  symbol: string
  api_symbol: string
}

const transformations: Record<string, string> = {
  usd: 'usdt'
}

const fetchCoinId = async (coinSymbol: string): Promise<string | undefined> => {
  const transformedSymbol = transformations[coinSymbol] ?? coinSymbol

  const response = await Request.get<CoinsData>(`${baseUrl}/search`, { params: { query: transformedSymbol } })

  if (!response.data) {
    logger.error(`No response for ${coinSymbol}`)
    return undefined
  }

  const matchingCoin = response.data.coins.find((coin) => coin.symbol.toLowerCase() === transformedSymbol.toLowerCase())

  if (!matchingCoin) {
    logger.error(`No matching coin for ${coinSymbol}`)
  }

  return matchingCoin?.api_symbol
}

interface CoinHistoryData {
  market_data: { current_price: Record<string, number> }
}

const fetchCoinPrice = async (currencyId: string, date: Date, currency: string): Promise<number | undefined> => {
  const dateString = extractDateString(date)
  const response = await Request.get<CoinHistoryData>(`${baseUrl}/coins/${currencyId}/history`, { params: { date: dateString, localization: false } })

  if (!response.data) {
    logger.error(`No price for ${currencyId} at ${date.toString()}`)
    return undefined
  }

  return response.data.market_data.current_price[currency.toLowerCase()]
}

export const fetchCoinPriceByCoinSymbol = async (coinSymbol: string, date: Date, currency: string): Promise<number | undefined> => {
  const coinId = await fetchCoinId(coinSymbol)
  if (!coinId) return undefined
  const price = await fetchCoinPrice(coinId, date, currency)
  return price
}

const extractDateString = (date: Date): string => {
  const dayString = StringUtils.addLeadingZeros(date.getDate(), 2)
  const monthString = StringUtils.addLeadingZeros(date.getMonth() + 1, 2)
  return `${dayString}-${monthString}-${date.getFullYear()}`
}
