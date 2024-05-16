import axios from '../https'

import { useQuery } from 'react-query'

export const getClient = async ({ id }) => {
  const response = await axios.get(`/client/${id}`)

  return response?.data?.item
}

export const useClient = (params, options) => {
  return useQuery(['client', params], () => getClient(params), options)
}
