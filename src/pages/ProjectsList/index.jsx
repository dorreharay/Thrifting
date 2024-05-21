import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import cx from 'classnames'
import { sortBy } from 'lodash'
import { useProjects } from '../../api/useProjects'
import { useUser } from '../../api/useUser'
import Input from '../../components/Input'
import Loader from '../../components/Loader'
import useStorage from '../../hooks/storage'
import { MESSAGES } from '../../constants/messages'
import { getProjectPassword } from '../../api/project'

function ProjectsList() {
  const {
    data: projectsList = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useProjects()

  const navigate = useNavigate()

  const [credentials, setCredentials] = useStorage('credentials')
  const [project, setProject] = useStorage('project')

  const { data: user } = useUser({ enabled: !!credentials })

  const [entryLoading, setEntryLoading] = useState(false)

  const [values, setValues] = useState({ search: '' })

  const handleValue = e => {
    const field = e.target.name
    const value = e.target.value

    setValues(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleOFEntry = async project => {
    const id = project?._id
    const email = project?.onlyFans?.email

    try {
      setEntryLoading(id)

      if (import.meta.env.DEV) {
        alert('Not extension context.')
        setEntryLoading(false)
        return
      }

      const password = await getProjectPassword(id)

      window.close()

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })

      chrome.tabs.sendMessage(
        tab?.id,
        {
          type: MESSAGES.CREDENTIALS,
          payload: { email, password },
        },
        response => {
          if (response?.success) {
            setProject(project)
            navigate('/project')
          }

          setEntryLoading(false)
        },
      )
    } catch (error) {
      console.log('error - handleOFEntry', error)
    }
  }

  const list = useMemo(() => {
    const userId = user?._id
    const isAdmin =
      user?.roles?.includes('ADMIN') || user?.roles?.includes('SUDO')

    const preparedList = projectsList.filter(item => {
      const hasAccess =
        isAdmin || item?.managers.find(manager => manager?.id === userId)

      return hasAccess
    })

    const sorted = sortBy(preparedList, 'name')

    if (values?.search) {
      return sorted?.filter(item => {
        const name = item?.name.toLowerCase()
        const searchValue = values?.search.toLowerCase()

        return name.includes(searchValue)
      })
    }

    return sorted
  }, [values?.search, projectsList, user])

  const handleCopy = e => handle => {
    e.stopPropagation()

    navigator.clipboard.writeText(handle)
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        <h4 className="mb-4">Unexpected error occured. Please try again.</h4>
        <button
          type="submit"
          className="w-24 h-10 px-8 py-2 mb-5 bg-black hover:bg-zinc-800 disabled:bg-zinc-400 duration-200 text-white text-base rounded-full"
          onClick={refetch}
        >
          {!isRefetching ? 'Retry' : <Loader size={20} theme="white" />}
        </button>
      </div>
    )
  }

  return (
    <div className="pb-16 w-full overflow-y-auto pl-3 -ml-3 box-border">
      <Input
        className="bg-transparent p-2 pr-16 px-5 outline-none w-full"
        containerClassName="w-3/5 mt-6 mb-4"
        placeholder="Search"
        name="search"
        onChange={handleValue}
        value={values?.search}
        disabled={isLoading}
        showClearIcon
        prefix="search"
      />

      {isLoading && (
        <div className="mt-16 pt-16 w-full">
          <Loader />
        </div>
      )}

      {!isLoading && (
        <div className="h-full">
          <h4 className="px-1 pb-2 text-sm font-medium">
            Available Projects ({list?.length})
          </h4>
          <div className="pb-16 -ml-2">
            {list?.map((project, index) => (
              <button
                type="button"
                className={cx(
                  'flex items-center group w-full text-left p-1 px-3 cursor-pointer text-sm hover:bg-zinc-200 disabled:bg-zinc-50 disabled:opacity-50 rounded-full duration-200',
                  { 'bg-zinc-200': entryLoading === project?._id },
                  {
                    'text-rose-800':
                      project?.onlyFans?.emailError ||
                      project?.onlyFans?.passwordError,
                  },
                )}
                onClick={() => handleOFEntry(project)}
                key={project?._id}
                disabled={entryLoading && entryLoading !== project?._id}
              >
                <span className="inline-flex w-8 min-w-8 text-gray-600 text-xs">
                  {index + 1}.
                </span>{' '}
                <span>{project?.name}</span>
                <div className="ml-auto">
                  {entryLoading === project?._id && <Loader size={15} />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsList
