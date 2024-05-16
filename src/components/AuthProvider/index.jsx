import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import cx from 'classnames'
import useStorage from '../../hooks/storage'
import './styles.scss'

import axios from '../../https'
import { getProjectByHandle } from '../../api/project'

import Loader from '../Loader'
import Header from '../Header'

function AuthProvider(props) {
  const { children } = props

  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [
    credentials,
    setCredentials,
    isPersistent,
    error,
    isInitialStateResolved,
  ] = useStorage('credentials')
  const [
    project,
    setProject,
    isPersistentPr,
    errorPr,
    isInitialStateResolvedPr,
  ] = useStorage('project')

  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const getCurrentHandle = tab => {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        tab?.id,
        {
          type: 'HANDLE',
        },
        response => {
          if (response) {
            resolve(response)
          } else {
            reject('No context')
          }
        },
      )
    })
  }

  const validateToken = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })

      await chrome.tabs.sendMessage(tab?.id, { type: 'PING' })

      console.log('credentials', credentials)

      if (!credentials) {
        navigate('/')
        setIsLoggedIn(false)
        setLoading(false)

        return
      }

      const result = await axios.post('/auth/refresh-access', {
        token: credentials?.refreshToken,
      })

      setCredentials({ ...credentials, accessToken: result?.data?.token })

      axios.interceptors.request.use(function (config) {
        config.headers.Authorization = `Bearer ${result?.data?.token}`
        return config
      })

      setIsLoggedIn(!!result)

      const handle = await getCurrentHandle(tab)

      console.log('project', project)
      console.log('handle', handle)

      if (project) {
        if (handle && handle !== 'onlyfans') {
          console.log('project', project)
          setProject(project)
          navigate('/project')
        } else {
          setProject(null)
          navigate('/projects')
        }
      } else {
        if (handle && handle !== 'onlyfans') {
          const project = await getProjectByHandle(handle)

          console.log('project', project)
          console.log('handle', handle)

          if (project) {
            setProject(project)
            navigate('/project')
          }
        } else {
          navigate('/projects')
        }
      }
    } catch (error) {
      console.log('error', error?.message)
      if (
        error?.message ===
          'Could not establish connection. Receiving end does not exist.' ||
        error === 'No context'
      ) {
        navigate('/nocontext')
      } else {
        navigate('/')
      }

      setIsLoggedIn(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('isInitialStateResolved', isInitialStateResolved)
    if (isInitialStateResolved) {
      validateToken()
      // navigate('/settings')
      // setLoading(false)
    }
  }, [isInitialStateResolved])

  useEffect(() => {
    setIsLoggedIn(!!credentials)

    if (credentials?.accessToken) {
      axios.interceptors.response.use(
        function (response) {
          return response
        },
        function (error) {
          if (error?.response?.data?.message === 'Token has expired.') {
            navigate('/')
            setIsLoggedIn(false)
            setCredentials(null)
          }
          return error
        },
      )
    }
  }, [credentials])

  return (
    <div
      className={cx('wrapper w-full bg-zinc-50', {
        'h-[500px]': pathname !== '/project' && pathname !== '/settings',
      })}
    >
      <Header
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setLoading={setLoading}
      />
      <div className="px-8 flex w-full h-full">
        {loading ? <Loader /> : children}
      </div>
    </div>
  )
}

export default AuthProvider