import axios from '../https'

import { useQuery } from 'react-query'

export const getUser = async () => {
  const response = await axios.get('/user/me')

  return response?.data?.item
}

export const useUser = options => {
  return useQuery(['user'], () => getUser(), options)
}
