import { type TaxableEvent } from '../../types/custom'
import * as TransactionDbService from './transactions.db.service'
import * as TaxableEventsComputeService from '../compute/taxableEvents.compute.service'

export const fetch = async (userId: string): Promise<TaxableEvent[]> => {
  const transactions = await TransactionDbService.fetch(userId)

  return await TaxableEventsComputeService.calculateTaxableEvents()
}
