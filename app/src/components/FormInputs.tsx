import React from 'react'

import { Path, UseFormReturn } from 'react-hook-form'
import { Form, FormInput } from '../types/form'
import { Select } from './Select'

export const FormInputs = <T extends Form>({ inputs, formData }: { inputs: Array<FormInput<T>>; formData: UseFormReturn<T> }): JSX.Element | null => {
  return (
    <>
      {inputs.map((input) => {
        const key = String(input.key) as Path<T>

        if (input.type === 'checkbox') {
          return (
            <div key={key} className='my-2 flex align-middle'>
              <input className='checkbox mr-2' type={input.type} {...formData.register(key)} required />
              <label htmlFor={key}>{input.label}</label>
            </div>
          )
        }

        if (input.type === 'select' && input.options) {
          return (
            <div key={key}>
              <label>{input.label}</label>
              <Select formData={formData} input={input} />
            </div>
          )
        }

        return (
          <div key={key}>
            <label>{input.label}</label>
            <input className='form-control' type={input.type} placeholder={String(input.label)} minLength={input.minLength} required {...formData.register(key)} />
          </div>
        )
      })}
    </>
  )
}
