import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../api/useClient'
import useStorage from '../../hooks/storage'

function Settings() {
  const navigate = useNavigate()
  const [savedProject, setProject] = useStorage('project')

  const [unsending, setUnsending] = useState(false)

  const { data: project, isLoading } = useClient(
    { id: savedProject?.clientId },
    { enabled: !!savedProject?.clientId },
  )

  const fields = useMemo(() => {
    if (!project) return []

    return [
      { title: 'Project Name', value: savedProject?.name },
      { title: 'Client', value: project?.username },
      { title: 'Onlyfans Handle', value: `@${savedProject?.onlyFans?.handle}` },
      {
        title: 'Age',
        value: project?.birthday
          ? new Date().getUTCFullYear() -
            new Date(project?.birthday).getUTCFullYear()
          : '',
      },
    ]
  }, [project])

  const handleGoBack = () => {
    navigate('/project')
  }

  const handleChangeSetting = e => {
    const checked = e.target.checked

    setUnsending(checked)

    chrome.storage.sync.set({
      unsending: checked,
    })
  }

  useEffect(() => {
    chrome.storage.sync.get(['unsending'], items => {
      const unsendOn = items?.unsending

      setUnsending(unsendOn)
    })
  }, [])

  return (
    <div className="py-6 pb-6 w-full">
      <div className="flex justify-between pb-4">
        <div />

        <button
          className="px-5 py-2 border-2 hover:bg-zinc-100 border-black duration-200 text-black text-sm font-medium rounded-full"
          onClick={handleGoBack}
        >
          Close Settings
        </button>
      </div>

      <div className="mt-6 px-5 min-h-[150px] items-center">
        <div class="main__switches">
          <div class="flex items-center justify-between">
            <label className="text-base">
              Turn on/off message auto unsending
            </label>
            <input
              id="unsending"
              class="apple-switch"
              type="checkbox"
              checked={unsending}
              onChange={handleChangeSetting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
