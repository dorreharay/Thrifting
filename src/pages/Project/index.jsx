import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClient } from '../../api/useClient'
import Loader from '../../components/Loader'
import { logoutFromProject } from '../../helpers'
import useStorage from '../../hooks/storage'

function Project() {
  const navigate = useNavigate()
  const [savedProject, setProject] = useStorage('project')

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

  const handleLogoutFromProject = async () => {
    setProject(null)
    navigate('/projects')

    logoutFromProject()
  }

  const redirectToSettings = () => {
    navigate('/settings')
  }

  return (
    <div className="py-6 pb-6 w-full h-full">
      <div className="flex justify-between pb-4">
        <button
          className="px-5 py-2 bg-black hover:bg-zinc-700 duration-200 text-white text-sm font-medium rounded-full"
          onClick={handleLogoutFromProject}
        >
          Logout from the project
        </button>

        <button
          className="px-5 py-2 border-2 hover:bg-zinc-100 border-black duration-200 text-black text-sm font-medium rounded-full"
          onClick={redirectToSettings}
        >
          Open Settings
        </button>
      </div>

      <div className="mt-6 px-5 min-h-[150px] items-center">
        {!isLoading ? (
          <>
            {fields?.map(field => (
              <div className="flex text-base mb-1" key={field?.name}>
                <div className="w-2/5 text-zinc-600">{field?.title}:</div>
                <div className="w-3/5 ml-2 font-medium text-zinc-900">
                  {field?.value}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="pt-14">
            <Loader />
          </div>
        )}
      </div>
    </div>
  )
}

export default Project
