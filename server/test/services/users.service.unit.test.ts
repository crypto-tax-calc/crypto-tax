import * as UsersService from '../../src/services/db/users.db.service'
import { Language } from '@fstmswa/types'

describe('Users', () => {
  test('create, fetch, update and delete user', async () => {
    const c1 = await UsersService.register({ firstName: 'first', lastName: 'last', email: 'test@email.no', password: 'password', language: Language.English, termsAndPolicyAccepted: true })
    expect(c1).toBeDefined()
  })
})
