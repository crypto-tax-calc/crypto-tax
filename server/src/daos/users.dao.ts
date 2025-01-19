import { type User } from '@prisma/client'
import { prismaClient } from '../config/database'
import { type RegisterUserInput } from '@fstmswa/types'

export const fetch = async (): Promise<User[]> => {
  return await prismaClient.user.findMany()
}

export const fetchOne = async ({ id, email }: { id?: string; email?: string }): Promise<User | null> => {
  return await prismaClient.user.findUnique({
    where: {
      id,
      email: email?.toLowerCase()
    }
  })
}

export const create = async (data: Omit<RegisterUserInput, 'password'> & { hash: string }): Promise<User> => {
  return await prismaClient.user.create({
    data: {
      ...data,
      email: data.email.toLowerCase()
    }
  })
}

export const update = async (id: string, data: Partial<Omit<User, 'id'>>): Promise<User> => {
  return await prismaClient.user.update({
    where: {
      id
    },
    data
  })
}

export const remove = async (id: string): Promise<User> => {
  return await prismaClient.user.delete({
    where: {
      id
    }
  })
}
