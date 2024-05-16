import axios from './libs/axios.min.js?script&module'
import Buffer from 'buffer'
import sha1 from 'sha1'

const getCookie = () => {
  return new Promise(resolve => {
    chrome.cookies.get(
      { url: 'https://onlyfans.com/', name: 'auth_id' },
      function (cookie) {
        resolve(cookie?.value)
      },
    )
  })
}

const getUserId = async () => {
  const { data } = await getCookie()

  return data.data
}

export async function getAuthParams(url) {
  try {
    axios.defaults.withCredentials = false

    const rules = await axios.get(
      'https://raw.githubusercontent.com/deviint/onlyfans-dynamic-rules/main/dynamicRules.json',
    )

    axios.defaults.withCredentials = true

    const dynamicRules = rules?.data

    const x_bc = localStorage.getItem('bcTokenSha')

    const auth_id = await getUserId()

    async function getHeaders() {
      const id = auth_id
      const auth = {}

      auth['Content-Type'] = 'application/json; charset=utf-8'
      // auth['Accept'] = 'application/json, text/plain, */*'
      // auth['Accept-Language'] =
      //   'en,es;q=0.9,en-US;q=0.8,uk;q=0.7,pl;q=0.6,lt;q=0.5'
      auth['App-Token'] = dynamicRules?.app_token
      auth['X-Bc'] = x_bc
      auth['User-Id'] = id

      return { id, auth }
    }

    function signHeaders(id, headers) {
      const time = +new Date()
      const msg = [dynamicRules['static_param'], time, url, id].join('\n')
      const shaHash = sha1(msg)
      const hashAscii = Buffer.from(shaHash, 'ascii')

      const checksum =
        dynamicRules['checksum_indexes'].reduce(
          (result, value) => result + hashAscii[value],
          0,
        ) + dynamicRules['checksum_constant']
      const sign = [
        dynamicRules['start'],
        shaHash,
        Math.abs(checksum).toString(16),
        dynamicRules['end'],
      ].join(':')

      return {
        ...headers,
        sign,
        time,
      }
    }

    const { id, auth } = await getHeaders()
    return signHeaders(id, auth)
  } catch (error) {
    console.log('error', error)
  }
}
