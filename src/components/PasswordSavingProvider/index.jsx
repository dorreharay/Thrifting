import { useState, useEffect } from 'react'
import './styles.scss'

import Header from '../Header'
import Loader from '../Loader'

function PasswordSavingProvider({ children }) {
  const [isLoading, setLoadingState] = useState(true)
  const [isInvalidSettings, setIsInvalidSettings] = useState(true)

  useEffect(() => {
    if (import.meta.env.DEV) {
      setLoadingState(false)
      setIsInvalidSettings(false)
      return
    }

    chrome.privacy.services.passwordSavingEnabled.get({}, async details => {
      const disabled = details?.value

      setIsInvalidSettings(disabled)

      setLoadingState(false)
    })
  }, [])

  const handleOpenSettings = () => {
    if (!import.meta.env.DEV) {
      chrome.tabs.create({
        url: 'chrome://password-manager/settings',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="px-8 flex w-full h-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (isInvalidSettings) {
    return (
      <>
        <div className="flex flex-col w-full h-full">
          <Header />

          <div className="p-8 text-base">
            <p>
              This extension is not allowed to run with password saving featured
              enabled in Google Chrome. Please follow the next steps to disable
              it:
            </p>

            <ul class="list-disc mt-2 ml-6 flex flex-col gap-1">
              <li>
                <span>Go to </span>
                <button
                  class="text-blue-500 strong"
                  onClick={handleOpenSettings}
                >
                  chrome://password-manager/settings
                </button>
              </li>
              <li>
                <div>
                  Make sure that <strong>Offer to save passwords</strong> and
                  <strong>Sign in automatically</strong> are disabled, like you
                  can see in the image bellow.
                </div>
                <div class="password-saving mt-2" />
              </li>
              <li>Restart the Browser</li>
            </ul>
          </div>
        </div>
      </>
    )
  }

  return children
}

export default PasswordSavingProvider
