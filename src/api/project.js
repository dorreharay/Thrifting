import axios from '../https'

export const getProjectPassword = async projectId => {
  const response = await axios.get(
    `/client-project/request-of-password/${projectId}/chatter`,
  )

  return response?.data?.password
}

export const getProjectByHandle = async handle => {
  const response = await axios.get(`/client-project/of-handle/${handle}`)

  return response?.data?.item
}
