import path from 'path'
import { Transaction } from '../types/custom'
import * as TaxableEventsService from '../services/compute/taxableEvents.compute.service'
import { logger } from '../config/logger'
import { sum } from 'lodash'

const fs = require('fs')
const { parse } = require('csv-parse')

void (async () => {
  const transactions: Transaction[] = []

  await fs
    .createReadStream(path.join(__dirname, 'transactions.csv'))
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
      const [kind, buyAmount, buyCurrency, sellAmount, sellCurrency, feeAmount, feeCurrency, exchange, ExchangeId, Group, Import, Comment, date, NOKEquivalent, UpdatedAt] = row

      transactions.push({
        id: transactions.length.toString(),
        date: new Date(date),
        kind,
        buyAmount: buyAmount ? parseFloat(buyAmount) : null,
        buyCurrency: buyCurrency ? buyCurrency.toLowerCase() : null,
        sellAmount: sellAmount ? parseFloat(sellAmount) : null,
        sellCurrency: sellCurrency ? sellCurrency.toLowerCase() : null,
        feeAmount: feeAmount ? parseFloat(feeAmount) : null,
        feeCurrency: feeCurrency ? feeCurrency.toLowerCase() : null
      })
    })
    .on('end', async () => {
      const filtered = transactions.filter((tx) => tx.date.getFullYear() === 2017)
      const taxableEvents = await TaxableEventsService.calculateTaxableEvents(filtered, 'nok')
      const gainsOrLosses = taxableEvents.map((ev) => ev.gainOrLoss)
      const gains = gainsOrLosses.filter((gol) => gol > 0)
      const losses = gainsOrLosses.filter((gol) => gol < 0)
      logger.info(`Gains: ${sum(gains)}, Losses: ${sum(losses)}`)
    })
})()
