import axios from './libs/axios.min.js'
import { getAuthParams } from './request.js'

import { initThrifting } from './initialize.js'

initThrifting()

const request = async () => {
  const url = `/api2/v2/users/lexykhadra`

  try {
    const authParams = await getAuthParams(url)

    const user = await axios.get(`https://onlyfans.com${url}`, {
      headers: authParams
    })
  } catch (error) {
    console.log('error', error)
  }
}

// request()

// ;<div data-v-29df7606="" class="b-dropzone__preview m-loaded m-with-btn-play">
//   <a
//     href="https://of2transcoder.s3.amazonaws.com/upload/17f0c0f5-53b2-4d41-baaf-7b37af7afe49/1187063844991/home__slider_bg2.png?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&amp;X-Amz-Algorithm=AWS4-HMAC-SHA256&amp;X-Amz-Credential=AKIAUSX4CWPPNPVP5H5I%2F20240112%2Fus-east-1%2Fs3%2Faws4_request&amp;X-Amz-Date=20240112T143302Z&amp;X-Amz-SignedHeaders=host&amp;X-Amz-Expires=604800&amp;X-Amz-Signature=8d0757147b476855dd8020e108885d014e7edadfd9a3b4b59b2b7792f37e2796"
//     class="media-file m-default-bg m-media-el"
//   >
//     <img
//       src="https://cdn2.onlyfans.com/files/e/e5/e5a10652470227c797e3f48f7fad26da/300x296_4152aa39e0d3f5e7e8d49e618a2871ca.jpg?Expires=1736692382&amp;Signature=bFRycK9NpOIIdDTa69pvKBdJt7g-1oxbcvUJh~Kj~N8KkLglqv5x2sISHtf30~qtg~Fvx56fN7l95BeYvrChQPTnpQOEiLnzuTVxOpSS3j7qJ~qAdH3Oiy~8mYFpPrWxz6Vik1COHo44k57v7vZ4sTA4DagFmfOQJoPJHsMRsjK70qt1PaySQf6NdZvgx6Ai91j9X0sRbvxiyRfdH59ozrc6LABQ1ubUjeZV~pSW3rSMBbLO4mQnBeXBHHe95BJ6V5yYrS3iHuByXGWdROmixvevT9eiWLrws4wzdf6DaWIPw0YtWSGXO42-pKr3U-1Fy3G3vZmsVqmSwXapk30QTg__&amp;Key-Pair-Id=APKAJZU4IULC2OKULHGA"
//       alt="home__slider_bg2.png"
//       title="home__slider_bg2.png"
//       class="b-dropzone__preview__media"
//     ></img>
//   </a>
//   <button
//     type="button"
//     class="b-dropzone__preview__delete g-btn m-rounded m-reset-width m-thumb-r-corner-pos m-btn-remove m-sm-icon-size has-tooltip"
//     data-original-title="null"
//   >
//     <svg data-icon-name="icon-close" aria-hidden="true" class="g-icon">
//       <use
//         href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401121347-36664a5bec#icon-close"
//         xlink:href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401121347-36664a5bec#icon-close"
//       ></use>
//     </svg>
//   </button>
//   <button
//     type="button"
//     class="b-dropzone__preview__edit"
//     data-original-title="null"
//   >
//     <svg data-icon-name="icon-edit" aria-hidden="true" class="g-icon">
//       <use
//         href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401121347-36664a5bec#icon-edit"
//         xlink:href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401121347-36664a5bec#icon-edit"
//       ></use>
//     </svg>
//   </button>
// </div>

// import sha1 from './sha1.js'
// import axios from './axios.min.js'
// import Buffer from './buffer.js'

// const username = 'lexykhadra'

// let url = `/api2/v2/users/${username}`

// // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
// //   console.log('[LOG]', message)
// //   return true
// // })

// const rules = await axios.get(
//   'https://raw.githubusercontent.com/deviint/onlyfans-dynamic-rules/main/dynamicRules.json',
// )

// const dynamicRules = rules?.data

// console.log('dynamicRules', dynamicRules)

// // let cookieString = ''
// const x_bc = localStorage.getItem('bcTokenSha')

// export async function getHeaders() {
//   let id = '370636793'
//   let auth = {}

//   auth['Content-Type'] = 'application/json; charset=utf-8'
//   auth['Accept'] = 'application/json, text/plain, */*'
//   auth['Accept-Language'] = 'en,es;q=0.9,en-US;q=0.8,uk;q=0.7,pl;q=0.6,lt;q=0.5'
//   auth['App-Token'] = dynamicRules?.app_token
//   auth['X-Bc'] = x_bc
//   auth['User-Id'] = id

//   return { id, auth }
// }

// export function signHeaders(url, id, headers) {
//   const time = +new Date()
//   const msg = [dynamicRules['static_param'], time, url, id].join('\n')
//   const shaHash = sha1(msg)
//   const hashAscii = Buffer.from(shaHash, 'ascii')

//   const checksum =
//     dynamicRules['checksum_indexes'].reduce(
//       (result, value) => result + hashAscii[value],
//       0,
//     ) + dynamicRules['checksum_constant']
//   const sign = [
//     dynamicRules['start'],
//     shaHash,
//     Math.abs(checksum).toString(16),
//     dynamicRules['end'],
//   ].join(':')

//   return {
//     ...headers,
//     sign,
//     time,
//   }
// }

// let { id, auth } = await getHeaders()
// let signedAuth = signHeaders(url, id, auth)

// axios.defaults.withCredentials = true

// await axios.get(`https://onlyfans.com${url}`, {
//   headers: signedAuth,
// })
