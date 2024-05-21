import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutFromProject } from '../../helpers'
import useStorage from '../../hooks/storage'
import axios from '../../https'
import Loader from '../Loader'

function Header(props) {
  const {
    loading,
    isLoggedIn,
    setIsLoggedIn = () => {},
    setLoading = () => {},
  } = props

  const navigate = useNavigate()

  const [credentials, setCredentials] = useStorage('credentials')

  const [modalState, setModalState] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const logout = async () => {
    try {
      setLogoutLoading(true)
      await axios.post('/auth/logout', { token: credentials?.refreshToken })

      setCredentials(null)

      await logoutFromProject()

      handleCloseModal()

      navigate('/')

      setIsLoggedIn(false)
    } catch (error) {
      setIsLoggedIn(false)

      console.log('error - logout', error)
    } finally {
      setLoading(false)
      setLogoutLoading(false)
    }
  }

  const handleCloseModal = () => {
    setModalState(false)
  }

  const handleOpenModal = () => {
    setModalState(true)
  }

  const version = useMemo(() => {
    return chrome?.runtime?.getManifest?.()?.version
  }, [chrome?.runtime])

  return (
    <>
      <header className="px-8 header shadow-sm">
        <div className="header__logo" />

        <div className="flex">
          <>
            {!loading && (
              <p className="flex m-auto mr-5 text-sm">
                {version ? `v${version}` : 'No version'}
              </p>
            )}

            {!loading && isLoggedIn && (
              <button
                className="px-5 py-2 bg-rose-800 hover:bg-rose-900 duration-200 text-white text-sm font-medium rounded-full"
                onClick={handleOpenModal}
              >
                Logout
              </button>
            )}
          </>
        </div>
      </header>
      {modalState && (
        <>
          <div className="absolute left-0 top-0 w-full h-full bg-zinc-100 opacity-70 z-10"></div>
          <div className="absolute left-1/2 top-1/4 w-3/5 -translate-x-2/4 bg-white p-10 py-6 z-20 rounded-md">
            <h2 className="text-lg">Do you really want to logout?</h2>

            <div className="flex mt-4 gap-2">
              <button
                className="px-5 py-1.5 border-2 text-black text-base duration-200 font-medium rounded-full"
                onClick={handleCloseModal}
                disabled={logoutLoading}
              >
                Cancel
              </button>

              <button
                className="px-5 w-24 py-1.5 bg-zinc-950 duration-200 text-white text-base font-medium rounded-full"
                onClick={logout}
                disabled={logoutLoading}
              >
                {!logoutLoading ? (
                  'Log out'
                ) : (
                  <Loader size={20} theme="white" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Header
