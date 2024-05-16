import axios from '../https'

import { useQuery } from 'react-query'

export const getProjects = async (params) => {
  const response = await axios.get('/client-project/all', { params })

  return response?.data?.items
}

export const useProjects = (params, options) => {
  return useQuery(['projects'], () => getProjects(params), options)
}
