import { useState, useEffect } from 'react'
import Header from '../Header'
import Loader from '../Loader'

function TabProvider({ children }) {
  const [isLoading, setLoadingState] = useState(true)
  const [isInvalidTab, setIsInvalidTab] = useState(false)

  const getActiveTab = async () => {
    if (import.meta.env.DEV) {
      setLoadingState(false)
      return
    }

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
      })

      if (!tab.url?.includes('onlyfans.com')) {
        setIsInvalidTab(true)
      }
    } catch (error) {
      console.log('error - getActiveTab', error)
    } finally {
      setLoadingState(false)
    }
  }

  useEffect(() => {
    getActiveTab()
  }, [])

  if (isLoading) {
    return (
      <div className="px-8 flex w-full h-[500px] items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (isInvalidTab) {
    return (
      <>
        <div className="flex flex-col w-full h-[500px]">
          <Header />
          <p className="relative py-10 m-auto text-base -top-4">
            This extension works only on OnlyFans.com
          </p>
        </div>
      </>
    )
  }

  return children
}

export default TabProvider
