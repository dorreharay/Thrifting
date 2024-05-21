import axios from 'axios'
import useStorage from './hooks/storage'

const instance = axios.create({
  baseURL: 'https://hub.creatorsinc.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
    timeout: 30000,
  },
})

export default instance
