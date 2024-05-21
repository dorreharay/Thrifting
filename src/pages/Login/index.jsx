import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Loader from '../../components/Loader'

import axios from '../../https'
import useStorage from '../../hooks/storage'
import Input from '../../components/Input'

const initialValues = {
  email: 'paigeelliott@creatorsinc.com',
  password: 'aym*fpm3EMK3hxy0brp',
  // email: '',
  // password: '',
}

function Login() {
  const navigate = useNavigate()

  const [credentials, setCredentials] = useStorage('credentials')
  const [project] = useStorage('project')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [values, setValues] = useState(initialValues)

  const handleValue = e => {
    const field = e.target.name
    const value = e.target.value

    setValues(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    setError(false)

    if (!values?.email || !values?.password) return

    try {
      setIsLoading(true)

      const result = await axios.post('/auth/login', values)

      setCredentials(result?.data)

      if (project) {
        navigate('/project')
      } else {
        navigate('/projects')
      }
    } catch (error) {
      setError(error?.response?.data?.message || 'Unexpected Error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="flex w-full pt-12 flex-col" onSubmit={handleSubmit}>
      <Input
        type="email"
        className="bg-transparent p-3 px-5 outline-none w-full"
        placeholder="Email"
        name="email"
        onChange={handleValue}
        value={values?.email}
        disabled={isLoading}
      />

      <Input
        className="bg-transparent p-3 pr-16 px-5 outline-none w-full"
        placeholder="Password"
        name="password"
        onChange={handleValue}
        value={values?.password}
        disabled={isLoading}
        showPasswordIcon
      />

      {error && (
        <div className="px-5 py-2 bg-rose-800 font-medium text-white text-xs rounded-full">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="mt-auto py-3 mb-10 bg-black hover:bg-zinc-800 disabled:bg-zinc-400 duration-200 text-white text-base w-full rounded-full"
        disabled={isLoading || !values?.email || !values?.password}
      >
        {!isLoading ? 'Login' : <Loader size={24} theme="white" />}
      </button>
    </form>
  )
}

export default Login
