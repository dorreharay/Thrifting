import React from 'react'

function NoContext() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <div className="p-8 text-base">
        <p>
          This extension could not find page context. Please refresh website
          page and reopen the extension.
        </p>
      </div>
    </div>
  )
}

export default NoContext
