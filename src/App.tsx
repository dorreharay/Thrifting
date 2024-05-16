// <reference types="chrome"/>

import { useState, useEffect } from 'react'
import './App.scss'

function App() {
  const [unsending, setUnsendingState] = useState(false)

  const handleChange = (e: any) => {
    setUnsendingState(e?.target?.checked)

    chrome.storage.sync.set({
      unsending: e?.target?.checked
    })
  }

  useEffect(() => {
    chrome.storage.sync.get(['unsending'], items => {
      let unsendOn = items?.unsending

      setUnsendingState(unsendOn)
    })
  }, [])

  return (
    <div className="main">
      <h1 className="main__title">Settings</h1>

      <div className="main__switches">
        <div className="main__switches">
          <div className="main__switches__row">
            <label>Turn on/off message auto unsending</label>
            <input
              className="apple-switch"
              type="checkbox"
              checked={unsending}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
