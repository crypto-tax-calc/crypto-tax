import { type Transaction } from '@prisma/client'
import { prismaClient } from '../config/database'

export const create = async (data: Array<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Array<Transaction>> => {
  return await prismaClient.transaction.createMany({
    data
  })
}

export const fetch = async (userId: string): Promise<Transaction[]> => {
  return await prismaClient.user.findMany({
    where: { userId }
  })
}

export const update = async (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Transaction | null> => {
  return await prismaClient.transaction.update({
    where: { id },
    data
  })
}

export const remove = async (id: string): Promise<Transaction | null> => {
  return await prismaClient.transaction.delete({
    where: { id }
  })
}
