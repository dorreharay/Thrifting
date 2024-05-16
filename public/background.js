chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('request', request)
  if (request.type === 'COOKIE') {
    chrome.cookies.get(
      { url: 'https://onlyfans.com/', name: 'auth_id' },
      function (cookie) {
        console.log('cookie', cookie)
        sendResponse(cookie?.value)
      },
    )

    return true
  }
})
