chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {
    chrome.runtime.sendMessage({
      type: 'LOADED',
    })
  }
})
