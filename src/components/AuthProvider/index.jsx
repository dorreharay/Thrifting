import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import cx from 'classnames'
import useStorage from '../../hooks/storage'
import './styles.scss'

import axios from '../../https'
import { getProjectByHandle } from '../../api/project'

import Loader from '../Loader'
import Header from '../Header'
import { logoutFromProject } from '../../helpers'

function AuthProvider(props) {
  const { children } = props

  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [
    credentials,
    setCredentials,
    isPersistent,
    errorCreds,
    isInitialStateResolved,
  ] = useStorage('credentials')
  const [
    project,
    setProject,
    isPersistentPr,
    errorPr,
    isInitialStateResolvedPr,
  ] = useStorage('project')
  const [error, setError] = useStorage('error')

  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isContentScriptLoaded, setIsContentScriptLoaded] = useState(false)

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null)
      }, 3000)
    }
  }, [error])

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

      setIsLoggedIn(!!result)

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })

      const handle = await getCurrentHandle(tab)

      console.log('project', project)

      if (project) {
        if (handle && handle !== 'onlyfans') {
          setProject(project)
          navigate('/project')
        } else {
          setProject(null)
          navigate('/projects')
        }
      } else {
        if (handle && handle !== 'onlyfans') {
          const project = await getProjectByHandle(handle)

          if (project) {
            setProject(project)
            navigate('/project')
          } else {
            setError(`Project @${handle} Not Found`)
            await logoutFromProject()
            navigate('/projects')
          }
        } else {
          navigate('/projects')
        }
      }
    } catch (error) {
      console.log('error - validateToken', error)

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

  const init = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })

    chrome.tabs.sendMessage(tab?.id, { type: 'PING' }, loaded => {
      if (loaded) {
        setTimeout(() => {
          setIsContentScriptLoaded(true)
        }, 1000)
      } else {
        const timeout = setTimeout(() => {
          chrome.tabs.reload()
        }, 5000)

        const interval = setInterval(async () => {
          chrome.tabs.sendMessage(tab?.id, { type: 'PING' }, loaded => {
            if (loaded) {
              clearInterval(interval)
              clearTimeout(timeout)

              setTimeout(() => {
                setIsContentScriptLoaded(true)
              }, 1000)
            }
          })
        }, 1000)
      }
    })
  }

  useEffect(() => {
    if (isInitialStateResolved && isContentScriptLoaded && chrome?.tabs) {
      validateToken()
    }
  }, [isInitialStateResolved, isContentScriptLoaded, chrome?.tabs])

  useEffect(() => {
    init()
  }, [])

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
      <div
        className={cx(
          'w-full px-8 bg-rose-800 text-white font-regular text-sm transition-opacity opacity-0',
          { 'opacity-100 py-2': !!error, 'h-[0px]': !error },
        )}
      >
        {error}
      </div>
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
