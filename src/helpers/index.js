export const logoutFromProject = async () => {
  await chrome.browsingData.removeCookies({
    origins: ['https://onlyfans.com'],
  })

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  })

  chrome.tabs.sendMessage(tab?.id, {
    type: 'REFRESH',
  })
}
