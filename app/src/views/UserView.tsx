import { FormInput, FormInputs } from '../components/FormInputs'
import React from 'react'
import { useMutation } from '@apollo/client'
import UPDATE_USER from '../graphql/users/mutations/updateUser.graphql'
import { Language, UpdateUserMutation, UpdateUserMutationVariables } from '../types/graphql'
import { useDependencyState } from '../utils/stateHooks'
import { ButtonLoader } from '../components/ui/ButtonLoader'
import { toast } from 'react-hot-toast'
import { useCurrentUser } from '../utils/currentUserUtils'
import { useTranslation } from 'react-i18next'

const languageOptions = [{
  value: Language.Norwegian,
  label: 'Norsk',
  icon: <span className='fi fi-no' />
}, {
  value: Language.English,
  label: 'English',
  icon: <span className='fi fi-gb' />
}]

const useInputs = (): FormInput[] => {
  const { t } = useTranslation()
  return [
    {
      key: 'firstName',
      type: 'text',
      label: t('First name')
    },
    {
      key: 'lastName',
      type: 'text',
      label: t('Last name')
    }, {
      key: 'language',
      type: 'select',
      label: t('Language'),
      options: languageOptions
    }
  ]
}

export const UserView = (): JSX.Element | null => {
  const { t } = useTranslation()
  const currentUser = useCurrentUser()
  const [formData, setFormData] = useDependencyState({ firstName: currentUser?.firstName ?? '', lastName: currentUser?.lastName ?? '', language: currentUser?.language ?? Language.English }, [JSON.stringify(currentUser)])

  const handleCompleted = (): void => {
    toast.success(t('User updated'))
  }
  const [updateUser, { loading: updateUserLoading }] = useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UPDATE_USER, { onCompleted: handleCompleted })

  const inputs = useInputs()

  if (!currentUser) return null

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()

    await updateUser({ variables: { id: currentUser.id, input: formData } })
  }

  return (
    <div className='flex justify-center py-12'>
      <form className='max-w-lg' onSubmit={handleSubmit}>
        <FormInputs inputs={inputs} formData={formData} setFormData={setFormData} />
        <button className='w-full btn btn-primary' type='submit' disabled={updateUserLoading}>
          {updateUserLoading && <ButtonLoader className='inline mr-2' />}
          {t('Update')}
        </button>
      </form>
    </div>
  )
}
