const waitForPage = ({ selector, callback = () => {} }) => {
  const observer = new MutationObserver(function () {
    const container = document.querySelector(selector)

    if (container) {
      callback?.(container)
      observer.disconnect()
    }
  })

  observer.observe(document, {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true,
  })
}

waitForPage({
  selector: '.b-loginreg__form',
  callback: formEl => {
    if (formEl) {
      formEl.classList.add('cl-hidden')

      chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse,
      ) {
        if (request.type === 'CREDENTIALS') {
          console.log('emailInput', emailInput)

          if (emailInput) {
            emailInput.value = request?.payload?.email
            console.log('request', request)
            emailInput.dispatchEvent(new Event('input', { bubbles: true }))
          }

          const passwordInput = document.querySelector(`[name="password"]`)

          if (passwordInput) {
            passwordInput.value = request?.payload?.password
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
          }

          const submit = document.querySelector(`[type="submit"]`)

          if (submit) {
            setTimeout(() => {
              submit.click()

              const timeout = setTimeout(() => {
                sendResponse({ success: false })
              }, 5000)

              waitForPage({
                selector: '.l-header',
                callback: () => {
                  clearTimeout(timeout)
                  sendResponse({ success: true })
                },
              })

              waitForPage({
                selector: '.error_place_form',
                callback: () => {
                  clearTimeout(timeout)
                  sendResponse({ success: false })
                },
              })

              return true
            }, 1000)
          }
        }
      })
    }
  },
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'HANDLE') {
    const handleEl = document.querySelector('.g-user-username')
    const handle = handleEl?.innerText?.replace('@', '').trim()

    sendResponse(handle)

    return true
  }

  if (request.type === 'REFRESH') {
    location.reload(true)
  }

  if (request.type === 'PING') {
    sendResponse(true)
  }
})

console.log('[MAIN CONTENT SCRIPT INIT]')
