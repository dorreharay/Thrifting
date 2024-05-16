import useLocalStorageState from 'use-local-storage-state'
import { useChromeStorageSync } from 'use-chrome-storage'

function useStorage(key) {
  return import.meta.env.DEV
    ? useLocalStorageState(key)
    : useChromeStorageSync(key)
}

export default useStorage
