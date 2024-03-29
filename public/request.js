import axios from './libs/axios.min.js'
import Buffer from './libs/buffer.js'
import sha1 from './libs/sha1.js'

const getUserId = async () => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(chrome?.runtime?.id, 'message', cookie => {
      resolve(cookie)
    })
  })
}

export async function getAuthParams(url) {
  axios.defaults.withCredentials = false

  const rules = await axios.get(
    'https://raw.githubusercontent.com/deviint/onlyfans-dynamic-rules/main/dynamicRules.json'
  )

  axios.defaults.withCredentials = true

  const dynamicRules = rules?.data

  const x_bc = localStorage.getItem('bcTokenSha')

  const auth_id = await getUserId()

  async function getHeaders() {
    let id = auth_id
    let auth = {}

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
        0
      ) + dynamicRules['checksum_constant']
    const sign = [
      dynamicRules['start'],
      shaHash,
      Math.abs(checksum).toString(16),
      dynamicRules['end']
    ].join(':')

    return {
      ...headers,
      sign,
      time
    }
  }

  let { id, auth } = await getHeaders()
  return signHeaders(id, auth)
}
