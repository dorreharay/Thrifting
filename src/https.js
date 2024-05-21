import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://hub.creatorsinc.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
    timeout: 30000,
  },
})

instance.interceptors.request.use(async function (config) {
  const data = await chrome.storage.sync.get('credentials')

  if (data?.credentials?.accessToken) {
    config.headers.Authorization = `Bearer ${data?.credentials?.accessToken}`
  }

  return config
})

export default instance
