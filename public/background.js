chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  chrome.cookies.get(
    { url: 'https://onlyfans.com/', name: 'auth_id' },
    function (cookie) {
      sendResponse(cookie?.value)
    }
  )

  return true
})
