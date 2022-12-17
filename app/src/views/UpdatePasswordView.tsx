import React from 'react'
import { UpdatePasswordMutation } from '../types/graphqlTypes'
import { toast } from 'react-hot-toast'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { RoutePaths } from '../types/custom'
import { FormInput, FormInputs } from '../components/FormInputs'
import { TermsAndPrivacy } from '../components/TermsAndPrivacy'
import { useSaveAuthenticationToken } from '../utils/authenticationUtils'
import { useTranslation } from 'react-i18next'
import Logo from '../assets/logo_no-bg_cropped.png'
import { useUpdatePasswordMutation } from '../types/graphqlOperations'
import { useForm } from 'react-hook-form'
import { Form } from '../types/form'

interface UpdatePasswordForm extends Form {
  password: string
}

const useInputs = (): Array<FormInput<UpdatePasswordForm>> => {
  const { t } = useTranslation()

  return [
    {
      key: 'password',
      type: 'password',
      label: t('New password'),
      minLength: 6
    }
  ]
}

export const UpdatePasswordView = (): JSX.Element => {
  const { t } = useTranslation()
  const formData = useForm<UpdatePasswordForm>()
  const [searchParams] = useSearchParams()

  const saveAuthenticationToken = useSaveAuthenticationToken()

  const navigate = useNavigate()

  const handleUpdatePasswordCompleted = (data: UpdatePasswordMutation): void => {
    if (!data?.updatePassword) {
      toast.error(t('Something went wrong'))
      return
    }

    saveAuthenticationToken(data.updatePassword)
    navigate(RoutePaths.MAIN)
  }

  const [updatePassword, { loading }] = useUpdatePasswordMutation({ onCompleted: handleUpdatePasswordCompleted })

  const handleUpdate = async (input: UpdatePasswordForm): Promise<void> => {
    const id = searchParams.get('id')
    const token = searchParams.get('token')

    if (!id || !token) {
      toast.error(t('Invalid link'))
      return
    }

    await updatePassword({ variables: { id, token, input } })
  }

  const inputs = useInputs()

  return (
    <div className='container-centered'>
      <div className='w-full max-w-lg'>
        <div className='card'>
          <div className='flex justify-center'>
            <img className='mb-2 text-center' width={150} src={Logo} alt='App logo' />
          </div>
          <form onSubmit={formData.handleSubmit(handleUpdate)}>
            <FormInputs inputs={inputs} formData={formData} />
            <button className='w-full btn btn-primary mt-4' type='submit' disabled={loading}>
              {t('Create new password')}
            </button>
            <p className='text-center mt-8'>
              {t('Do you remember your password')}?&nbsp;
              <NavLink className='text-blue-600' to={RoutePaths.LOGIN}>
                {t('Log in')}
              </NavLink>
            </p>
          </form>
        </div>
        <TermsAndPrivacy />
      </div>
    </div>
  )
}
