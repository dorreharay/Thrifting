import axios from './libs/axios.min.js'
import dayjs from './libs/dayjs/esm/index.js'
import {
  removeStatusWindow,
  resetSteps,
  setSuccessMessage,
  updateStep
} from './progress.js'
import { getAuthParams } from './request.js'

const disableOrigination = true

let prevDate = null
let isUnsentTab = false
let list = []
let sentList = []
let unsentList = []
const defaultVaultCollection = 'Mass Messages'
const fansListName = 'Fans'
const followingListName = 'Following'

const getSentBy = () => {
  try {
    return ''
  } catch (error) {
    console.log('error', error)
  }
}

async function getFullList(getValues, params) {
  let result = []
  const { list: items, hasMore: initialHasMore } = await getValues({
    ...params,
    offset: 0
  })

  result = items

  let finish = !initialHasMore
  let index = 1

  while (!finish) {
    const { list: new_items, hasMore } = await getValues({
      ...params,
      offset: index
    })

    finish = !hasMore
    index = index + 1

    result = [...result, ...new_items]
  }

  return result
}

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
    subtree: true
  })
}

const runThriftObserver = () => {
  const container = document.querySelector(
    '.vue-recycle-scroller__item-wrapper'
  )

  const observer = new MutationObserver(function (mutations) {
    mutations?.forEach(mutation => {
      if (
        mutation?.type === 'attributes' &&
        mutation?.attributeName === 'style'
      ) {
        insertRows?.()
      }
    })
  })

  observer.observe(container, {
    attributes: true,
    childList: false,
    characterData: false,
    subtree: false
  })

  return observer
}

export function initThrifting() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const navigation = window?.navigation
  if (navigation) {
    navigation.addEventListener('navigate', event => {
      const url = event?.destination?.url

      if (url?.includes('/mass_chats')) {
        waitForPage({
          selector: '.table-vs__tr__outer',
          callback: () => {
            document.removeEventListener('click', listenThriftClicks)

            insertElements?.()

            const tabs = document.querySelector('.b-tabs__nav')

            tabs.addEventListener('click', async e => {
              const button = document.querySelector(
                '.b-tabs__nav__item.m-current'
              )

              if (button?.textContent === ' Unsent ') {
                isUnsentTab = true

                waitForPage({
                  selector: '.table-vs__tr__outer',
                  callback: () => {
                    runThriftObserver()
                  }
                })

                if (unsentList?.length) {
                  list = unsentList
                } else {
                  const list1 = await getStatsList({
                    offset: 0,
                    type: 'unsent'
                  })
                  list = list1?.list
                }
              }

              if (button?.textContent === ' Sent ') {
                isUnsentTab = false
                waitForPage({
                  selector: '.table-vs__tr__outer',
                  callback: () => {
                    runThriftObserver()
                  }
                })

                list = sentList
              }
            })
          }
        })
      }

      if (
        !disableOrigination &&
        url?.includes('/my/chats/send') &&
        !url?.includes('&thrift=true')
      ) {
        waitForPage({
          selector: '.b-chat__btn-submit:not([disabled])',
          callback: element => {
            const buttonsContainer = document.querySelector(
              '.b-make-post__actions'
            )

            const duplicateButton = element.cloneNode(true)

            duplicateButton.id = 'thrift-schedule'
            duplicateButton.className = 'g-btn m-rounded'

            element.classList.add('thrift-hidden')

            buttonsContainer?.appendChild(duplicateButton)

            duplicateButton.addEventListener('click', async () => {
              insertNameEntry(0, true)

              handleThriftClick()
            })
          }
        })
      }
    })
  }

  if (
    window?.location?.href?.includes?.('scheduleMessageId') &&
    window?.location?.href?.includes?.('thrift')
  ) {
    waitForPage({
      selector: '.m-schedule',
      callback: () => {
        // const scheduleContainer = document.querySelector('.m-schedule')
        // const cancelButton = scheduleContainer.querySelector(
        //   '.b-dropzone__preview__delete'
        // )
        // cancelButton.click()

        const messageTextElem = document.querySelector('#new_post_text_input')

        if (messageTextElem) {
          messageTextElem.value = decodeHTMLEntities(messageTextElem.value)
        }

        let warningsContainer = document.querySelector('.b-chat__messages')

        if (!warningsContainer) {
          warningsContainer = document.querySelector(
            '.b-page-content.m-chat-footer'
          )
        }

        if (warningsContainer) {
          warningsContainer.insertAdjacentHTML(
            'beforebegin',
            `<div class="delete-schedule b-dropzone__previews b-make-post__schedule-expire-wrapper g-sides-gaps"><div data-v-3a575a76 data-v-ff61497c class="b-post-piece b-dropzone__preview m-schedule m-loaded g-pointer-cursor m-row">
              <svg
                data-v-3a575a76=""
                data-icon-name="icon-schedule"
                aria-hidden="true"
                class="g-icon"
              >
                <use
                  href="/theme/onlyfans/spa/icons/sprite.svg?rev=202402091031-f48e72d77c#icon-schedule"
                  xlink:href="/theme/onlyfans/spa/icons/sprite.svg?rev=202402091031-f48e72d77c#icon-schedule"
                ></use>
              </svg>
              We scheduled this for <strong style="display: contents;">one month in the future</strong>. Add the correct date before hitting Send.
              <button
                data-v-3a575a76=""
                type="button"
                title="Delete"
                class="b-dropzone__preview__delete g-btn m-rounded m-reset-width m-thumb-r-corner-pos m-sm-icon-size"
                id="thrift-schedule-delete"
              >
                Delete draft message
              </button>
            </div>
          </div>`
          )
        }

        document.addEventListener('click', async e => {
          const id = e.target.id
          const className = e.target.className
          const parentClassName = e?.target?.parentElement?.className
          const textContent = e?.target?.textContent

          if (id === 'thrift-schedule-delete') {
            const searchParams = new URLSearchParams(window.location.search)

            const messageId = searchParams.get('scheduleMessageId')

            await unsendMessage(messageId)

            window.close()
          }

          if (
            className === 'g-btn m-flat m-btn-gaps m-reset-width' &&
            parentClassName === 'modal-footer' &&
            textContent === ' Yes '
          ) {
            const searchParams = new URLSearchParams(window.location.search)

            const messageId = searchParams.get('scheduleMessageId')

            setTimeout(async () => {
              const message = await getMessageData(messageId)

              saveMassMessageLog(message)
            }, 500)
          }
        })
      }
    })
  }
}

const insertHeading = () => {
  const headingsContainer = document.querySelector('.table-vs__tr')

  if (headingsContainer?.innerText?.includes?.('THRIFT')) return

  const lastTableHeading = headingsContainer.lastChild

  const newTableHeading = lastTableHeading.cloneNode(true)

  newTableHeading.textContent = 'THRIFT'
  newTableHeading.style = 'width: 10%; display: flex; justify-content: center;'

  headingsContainer.appendChild(newTableHeading)
}

const insertRows = () => {
  const listContainer = document.querySelector(
    '.vue-recycle-scroller__item-wrapper'
  )

  const listItems = listContainer.childNodes

  listItems.forEach(element => {
    const row = element.querySelector('.table-vs__tr')

    const hasThriftButton = row.querySelector('#thrift')

    if (!hasThriftButton) {
      const newRowItem = document.createElement('div')

      newRowItem.className = 'table-vs__td'
      newRowItem.style =
        'display: flex; justify-content: center; width: 10%; padding-top: 10px; padding-bottom: 10px; color: #00aff0; cursor: pointer; border-bottom: 1px solid rgba(138,150,163,.25);'

      newRowItem.innerHTML = `<span id="thrift">Thrift</span>`

      row.appendChild(newRowItem)
    }
  })
}

function decodeHTMLEntities(text) {
  const textArea = document.createElement('textarea')
  textArea.innerHTML = text
  return textArea.value
}

function decodeToRegular(text) {
  return text.replace(/[^a-zA-Z ]/g, '').replace(/ /g, '')
}

const listenThriftClicks = e => {
  const id = e?.target?.id

  if (id === 'thrift') {
    if (!isUnsentTab && !sentList?.length) return
    if (isUnsentTab && !unsentList?.length) return

    const row = e?.target?.parentElement?.parentElement
    const text = row?.querySelector('.g-truncated-text')
    const content = text?.innerText

    let index = list?.findIndex(
      item =>
        decodeToRegular(decodeHTMLEntities(item?.textCropped)) ===
        decodeToRegular(content)
    )

    const cells = row?.childNodes
    const dateCellContent = cells?.[0]?.innerText?.trim?.()

    if (index === -1) {
      index = list?.findIndex(item => {
        const formattedDate = dayjs(item?.date).format('MMM D, YYYY h:mm a')

        return formattedDate === dateCellContent
      })
    }

    console.log('index 2', list, list?.[index])

    if (index === -1) {
      alert(
        "For some reason, our tool cannot thrift this message. Please help dev team by sharing on Slack the account as well as exact message & timestamp. If you don't hear back from us in 1 day, go ahead and thrift the message conventionally."
      )
      return
    }

    const modal = document.createElement('div')
    modal.id = 'thrift-modal'
    modal.innerHTML = `<div style="position: absolute; z-index: 1040;">
        <div
          role="dialog"
          aria-describedby="9j03d3vqv___BV_modal_body_"
          class="modal fade show"
          aria-modal="true"
          style="display: block; padding-left: 0px;"
        >
          <div class="modal-dialog modal-sm modal-dialog-centered">
            <span tabindex="0"></span>
            <div
              id="9j03d3vqv___BV_modal_content_"
              tabindex="-1"
              class="modal-content"
            >
              <div id="9j03d3vqv___BV_modal_body_" class="modal-body">
                <div class="dialog_message">Is there already an exclusion list for this?</div>
              </div>
              <footer id="9j03d3vqv___BV_modal_footer_" class="modal-footer">
                <button
                  id="thrift-close"
                  type="button"
                  class="g-btn m-flat m-btn-gaps m-reset-width"
                  data-index=${index}
                >
                  Cancel
                </button>

                <button
                  id="thrift-no-exclusion"
                  type="button"
                  class="g-btn m-flat m-btn-gaps m-reset-width"
                  data-index=${index}
                >
                  No Exclusion
                </button>

                <button
                  id="thrift-no"
                  type="button"
                  class="g-btn m-flat m-btn-gaps m-reset-width"
                  data-index=${index}
                >
                 Create new
                </button>
                <button
                  id="thrift-yes"
                  class="g-btn m-flat m-btn-gaps m-reset-width"
                  data-index=${index}
                >
                 Use Existing
                </button>
              </footer>
            </div>
            <span tabindex="0"></span>
          </div>
        </div>
        <div id="9j03d3vqv___BV_modal_backdrop_" class="modal-backdrop"></div>
      </div>`

    document.body.appendChild(modal)
  }

  const modal = document.querySelector('#thrift-modal')
  const entry = document.querySelector('#thrift-entry')

  if (id === 'thrift-close') {
    if (modal) {
      removeStatusWindow()
      resetSteps()
      modal.remove()
    }

    if (entry) {
      removeStatusWindow()
      resetSteps()
      entry.remove()
    }
  }

  if (id === 'thrift-no') {
    const index = e.target.dataset.index
    insertNameEntry(index)

    modal.remove()
  }

  if (id === 'thrift-yes') {
    const index = e.target.dataset.index
    performReThrifting(index)

    modal.remove()
  }

  if (id === 'thrift-entry-next') {
    const index = e.target.dataset.index
    const input = entry.querySelector('#thrift-name-entry')

    const value = input?.value

    if (
      value?.startsWith?.('XX') ||
      value?.includes?.('MMDDYY') ||
      value?.endsWith?.('Name')
    ) {
      alert('Invalid message format')
      return
    }

    handleNewThrift(index, value)
  }

  if (id === 'thrift-entry-new-next') {
    const input = entry.querySelector('#thrift-name-entry')

    const value = input?.value

    if (
      value?.startsWith?.('XX') ||
      value?.includes?.('MMDDYY') ||
      value?.endsWith?.('Name')
    ) {
      alert('Invalid message format')
      return
    }

    handleMessageRecreation(value)
  }

  if (id === 'thrift-entry-skip') {
    const button = document.querySelector('.b-chat__btn-submit:not([disabled])')

    if (button) {
      button.click()

      if (entry) {
        entry.remove()
      }
    }
  }

  if (id === 'thrift-selector-item' || id === 'thrift-no-exclusion') {
    const index = e.target.dataset.index
    const name = e.target.dataset.name
    const listId = e.target.dataset.listid

    handleReThrift(name, index, listId, id === 'thrift-no-exclusion')

    modal.remove()
  }
}

const getScheduledDate = async () => {
  const initialDate = new Date()

  initialDate.setMonth(initialDate.getMonth() + 1, 20)

  const resultDate = initialDate.toISOString()

  return getPrevDate(resultDate)
}

const getPrevDate = async resultDate => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['prevDate'], items => {
      const prevDate = items?.prevDate

      resolve(prevDate || resultDate)
    })
  })
}

const handleThriftClick = () => {
  document.addEventListener('click', listenThriftClicks)
}

const getExtensionVersion = () => {
  const manifestData = chrome.runtime.getManifest()

  return manifestData?.version
}

const saveThriftError = async payload => {
  try {
    await axios.post('https://thriftingapi.online/error-logs', {
      ...payload,
      extension_version: getExtensionVersion()
    })
  } catch (error) {}
}

const handleMessageRecreation = value => {
  const button = document.querySelector('.b-chat__btn-submit:not([disabled])')

  if (button) {
    button.click()

    const isScheduled = document.querySelector('.m-schedule')

    setTimeout(() => {
      const buttons = document.querySelectorAll(
        '.modal-footer > .g-btn.m-flat.m-btn-gaps.m-reset-width'
      )

      for (const el of buttons) {
        if (el?.textContent === ' Yes ') {
          el?.click()

          const entry = document.querySelector('#thrift-entry')

          entry?.remove()

          resetSteps('originationSteps')
          updateStep(0)

          setTimeout(async () => {
            const messageInfo = await getRecentMessage(isScheduled)
            const message = await getMessageData(messageInfo?.id)

            const existingLists = await findExclusionList(value)
            const hasDuplicate = existingLists?.find(
              item => item?.name === value
            )

            if (hasDuplicate) {
              removeStatusWindow()
              resetSteps()
              alert('Given exclusion list already exists')
              return
            }

            updateStep(1)

            await performSaveToListAndFolder(value, message?.id, message, true)

            updateStep(2)

            setTimeout(() => {
              setSuccessMessage()

              setTimeout(() => {
                removeStatusWindow()
                resetSteps()
              }, 500)
            }, 500)
          }, 1000)
        }
      }
    }, 200)
  }
}

const performSaveToListAndFolder = async (
  name,
  messageId,
  message,
  skipBuyers,
  listIdParam,
  skipExlusionAndBuyers
) => {
  try {
    let listId = listIdParam

    if (!skipExlusionAndBuyers) {
      if (!listId) {
        const exclusionListData = await createExclusionList(name)

        listId = exclusionListData?.id
      }
    }

    if (!skipBuyers) {
      const buyers = await getFullList(getMessageBuyers, { messageId })
      const buyerIds = buyers?.map(item => item?.id)

      await addBuyersToList(listId, messageId, buyerIds)

      // const selectedListUsers = await getFullList(getExclusionList, { listId })

      // const filteredBuyers = buyers?.filter(buyer => {
      //   const match = selectedListUsers?.find(
      //     listUser => listUser?.id == buyer?.id
      //   )

      //   return !match
      // })

      // const buyerIds = filteredBuyers?.map(item => item?.id)

      // if (filteredBuyers?.length) {
      //   const errorIds = await addUsersToExclusionList(listId, buyerIds)

      //   if (errorIds?.length) {
      //     const filteredIdsWithoutErrors = buyerIds?.filter(
      //       id => !errorIds?.includes(id)
      //     )

      //     if (filteredIdsWithoutErrors?.length) {
      //       await addUsersToExclusionList(
      //         listId,
      //         filteredIdsWithoutErrors,
      //         true
      //       )
      //     }

      //     saveThriftError({
      //       creator_username: message?.fromUser?.username,
      //       user_id: message?.fromUser?.id,
      //       message_id: message?.id,
      //       message_copy: message?.text,
      //       error_message: `Failed to add ids: ${errorIds?.join(', ')}`,
      //       error_type: 'cannot_add_users_to_exclusion_list',
      //       fan_ids: errorIds?.join(', ')
      //     })
      //   }
      // }
    }

    const defaultListIds = await getDefaultListIds()

    let vaultFolder = ''

    if (!skipExlusionAndBuyers) {
      await addMediaToVault(defaultVaultCollection, message)
      vaultFolder = await addMediaToVault(name, message)
    }

    return { vaultFolder, defaultListIds, listId }
  } catch (error) {
    return Promise.reject(error)
  }
}

const addBuyersToList = async (listId, messageId, buyerIds) => {
  try {
    const url = `/api2/v2/lists/${listId}/users/queue/${messageId}/buyers`

    try {
      const authParams = await getAuthParams(url)

      const { data } = await axios.post(
        `https://onlyfans.com${url}`,
        {
          addedUsers: buyerIds
        },
        {
          headers: authParams
        }
      )

      return data
    } catch (error) {
      console.log('error', error)

      return Promise.reject(error)
    }
  } catch (error) {}
}

const handleNewThrift = async (index, name) => {
  try {
    const messageId = list?.[index]?.id
    // const purchasedCount = list?.[index]?.purchasedCount

    // if (!purchasedCount) {
    //   removeStatusWindow()
    //   resetSteps()
    //   alert('No past buyers')
    //   return
    // }

    resetSteps()

    updateStep(1)

    const mess = await getMessageData(messageId)

    var message = { ...mess, ...list?.[index] }

    const existingLists = await findExclusionList(name)
    const hasDuplicate = existingLists?.find(item => item?.name === name)

    if (hasDuplicate) {
      removeStatusWindow()
      resetSteps()
      alert('Given exclusion list already exists')
      return
    }

    const { vaultFolder, buyerIds, listId, defaultListIds } =
      await performSaveToListAndFolder(name, messageId, message, false)

    let exclusionListInfo = { name: 'No Exclusion' }

    if (!skipExlusionAndBuyers) {
      exclusionListInfo = await getExclusionListInfo({ listId })
    }

    updateStep(2)

    // await handleUnsend(messageId)

    const resultDate = await getScheduledDate()

    const payload = {
      excludedLists: [listId],
      isCouplePeopleMedia: false,
      isForward: false,
      isScheduled: 1,
      lockedText: false,
      media: message?.media?.map(item => item?.id),
      previews: message?.previews,
      price: message?.price,
      scheduledDate: resultDate,
      text: message?.text,
      releaseForms: message?.releaseForms,
      userLists: [...(message?.userLists || []), ...(defaultListIds || [])]
    }

    saveThriftLog({
      ...payload,
      message,
      buyerIds,
      vault_folder_name: vaultFolder?.name || exclusionListInfo?.name,
      vault_folder_id: vaultFolder?.id,
      exclusion_list_name: exclusionListInfo?.name
    })

    await createScheduledMessage(payload)
  } catch (error) {
    removeStatusWindow()
    resetSteps()
    alert(
      'Failed to thrift the message. Please see the log in the network tab.'
    )
    console.log('error - handleHandleNewThrift', error)
  }
}

const saveThriftLog = async payload => {
  try {
    const response = await axios.post(
      'https://thriftingapi.online/thrifts',
      {
        creator_username: payload?.message?.fromUser?.username || '',
        current_of_message_id: payload?.message?.id || '',
        exclusion_list: payload?.excludedLists?.join(',') || '',
        purchased_users_list: payload?.buyerIds?.join(',') || '',
        created_at: payload?.message?.date || '',
        updated_at: payload?.message?.changedAt || '',
        vault_folder_name: payload?.vault_folder_name || '',
        vault_folder_id: payload?.vault_folder_id || '',
        exclusion_list_name: payload?.exclusion_list_name || '',
        extension_version: getExtensionVersion()
      },
      {
        withCredentials: true,
        credentials: true,
        headers: { withCredentials: true, credentials: true }
      }
    )

    chrome.storage.sync.set({
      thrift_id: response?.data?.id,
      unsend_date: new Date()
    })
  } catch (error) {
    console.log('error', error)
  }
}

const saveMassMessageLog = async payload => {
  try {
    const thrift_info = await axios.get(
      `https://thriftingapi.online/thrifts/${payload?.fromUser?.username}`
    )

    const sent_by = getSentBy()

    await axios.post('https://thriftingapi.online/mass-messages', {
      thrift_id: thrift_info?.data?.id || '',
      message: payload?.text || '',
      creator_username: payload?.fromUser?.username || '',
      send_date: payload?.createdAt,
      scheduled_at: payload?.scheduledAt,
      sent_by: sent_by || '',
      content_ids: payload?.media?.map(item => item?.id).join(',') || '',
      free_preview_ids:
        payload?.previews?.map(item => item?.id).join(',') || '',
      price: payload?.price || 0,
      updated_at: payload?.changedAt || '',
      created_at: payload?.createdAt || '',
      nr_of_views: payload?.message?.viewedCount || 0,
      nr_of_purchases: payload?.message?.purchasedCount || 0
    })
    chrome.storage.sync.set({ prevDate: payload?.scheduledAt })
    console.log('THRIFT LOG SUCCESS')
  } catch (error) {
    console.log('error', error)
  }
}

const handleReThrift = async (
  name,
  index,
  listId,
  skipExlusionAndBuyers = false
) => {
  try {
    const messageId = list?.[index]?.id

    // const purchasedCount = list?.[index]?.purchasedCount

    // if (!purchasedCount) {
    //   removeStatusWindow()
    //   resetSteps()
    //   alert('No past buyers')
    //   return
    // }

    resetSteps()

    updateStep(1)

    const mess = await getMessageData(messageId)

    var message = { ...mess, ...list?.[index] }

    const { vaultFolder, buyerIds, defaultListIds } =
      await performSaveToListAndFolder(
        name,
        messageId,
        message,
        skipExlusionAndBuyers,
        listId,
        skipExlusionAndBuyers
      )

    let exclusionListInfo = { name: 'No Exclusion' }

    if (!skipExlusionAndBuyers) {
      exclusionListInfo = await getExclusionListInfo({ listId })
    }

    updateStep(2)

    // await handleUnsend(messageId)

    const resultDate = await getScheduledDate()

    const payload = {
      excludedLists: [listId],
      isCouplePeopleMedia: false,
      isForward: false,
      isScheduled: 1,
      lockedText: false,
      media: message?.media?.map(item => item?.id),
      previews: message?.previews,
      price: message?.price,
      scheduledDate: resultDate,
      text: message?.text,
      releaseForms: message?.releaseForms,
      userLists: [...(message?.userLists || []), ...(defaultListIds || [])]
    }

    saveThriftLog({
      ...payload,
      message,
      buyerIds,
      vault_folder_name: vaultFolder?.name || exclusionListInfo?.name,
      vault_folder_id: vaultFolder?.id,
      exclusion_list_name: exclusionListInfo?.name
    })

    await createScheduledMessage(payload)
  } catch (error) {
    removeStatusWindow()
    resetSteps()
    alert(
      'Failed to thrift the message. Please see the log in the network tab.'
    )

    saveThriftError({
      creator_username: message?.fromUser?.username,
      user_id: message?.fromUser?.id,
      message_id: message?.id,
      message_copy: message?.text,
      error_message: error?.message,
      error_type: 'failed_to_thrift'
    })

    console.log('error - handleReThrift', error)
  }
}

const getDefaultListIds = async () => {
  try {
    const fansSearchResult = await findExclusionList(fansListName)
    const fansListId = fansSearchResult?.[0]?.id

    const followingSearchResult = await findExclusionList(followingListName)
    const followingListId = followingSearchResult?.[0]?.id

    return [fansListId, followingListId]
  } catch (error) {
    console.log('error', error)
  }
}

const findCollection = async name => {
  try {
    const { data: searchResult } = await searchForVaultCollection(name)

    let collection = searchResult?.list?.find(item => item?.name === name)

    if (!collection) {
      const newCollection = await createVaultCollection(name)

      collection = newCollection
    }

    return collection
  } catch (error) {
    console.log('error', error)
  }
}

const getMessageBuyers = async ({ messageId, offset = 0 }) => {
  const url = `/api2/v2/messages/queue/${messageId}/buyers?limit=100&offset=${
    offset * 100
  }&skip_users_dups=1&marker=0&format=infinite`

  try {
    const authParams = await getAuthParams(url)

    const { data } = await axios.get(`https://onlyfans.com${url}`, {
      headers: authParams
    })

    return data
  } catch (error) {
    console.log('error', error)

    return Promise.reject(error)
  }
}

const addMediaToVault = async (name, message) => {
  try {
    const collection = await findCollection(name)
    // Add to Mass Messages Vault Folder
    await addMediaToVaultCollection(
      collection?.id,
      message?.media?.map(item => item?.id)
    )

    return collection
  } catch (error) {
    console.log('error - addMediaToVault', error)
  }
}

const addMediaToVaultCollection = async (collectionId, mediaIds) => {
  const url = `/api2/v2/vault/lists/${collectionId}/media`

  try {
    const authParams = await getAuthParams(url)

    const data = await axios.post(
      `https://onlyfans.com${url}`,
      {
        mediaIds
      },
      { headers: authParams }
    )

    return data?.data
  } catch (error) {
    console.log('error', error)

    return Promise.reject(error)
  }
}

const createVaultCollection = async name => {
  const url = `/api2/v2/vault/lists`

  try {
    const authParams = await getAuthParams(url)

    const data = await axios.post(
      `https://onlyfans.com${url}`,
      {
        name
      },
      { headers: authParams }
    )

    return data?.data
  } catch (error) {
    console.log('error', error)

    return Promise.reject(error)
  }
}

const searchForVaultCollection = async query => {
  const url = `/api2/v2/vault/lists?view=main&offset=0&query=${encodeURIComponent(
    query
  )}&limit=10`

  try {
    const authParams = await getAuthParams(url)

    const data = await axios.get(`https://onlyfans.com${url}`, {
      headers: authParams
    })

    return data
  } catch (error) {
    console.log('error', error)

    return Promise.reject(error)
  }
}

const getStatsList = async ({ offset, type }) => {
  const url = `/api2/v2/messages/queue/stats?limit=100&offset=${offset * 100}${
    type ? `&type=${type}` : ''
  }&format=infinite`

  try {
    const authParams = await getAuthParams(url)

    const data = await axios.get(`https://onlyfans.com${url}`, {
      headers: authParams
    })

    return data?.data
  } catch (error) {
    console.log('error', error)

    return Promise.reject(error)
  }
}

// const getStats = async () => {
//   const url = `/api2/v2/messages/queue/stats`

//   try {
//     const authParams = await getAuthParams(url)

//     const data = await axios.get(`https://onlyfans.com${url}`, {
//       headers: authParams
//     })

//     return data?.data
//   } catch (error) {
//     console.log('error', error)

//     return Promise.reject(error)
//   }
// }

// getStats()

// const handleUnsend = async (id) => {
//   const navBar = document.querySelector('.b-tabs__nav')

//   const links = navBar.querySelectorAll('.b-tabs__nav__item')

//   await unsendMessage(id)

//   links?.[1].click()
//   links?.[0].click()
// }

const insertNameEntry = (index, skip) => {
  const modal = document.createElement('div')
  modal.id = 'thrift-entry'
  modal.innerHTML = `<div style="position: absolute; z-index: 1040;">
          <div
            role="dialog"
            aria-describedby="9j03d3vqv___BV_modal_body_"
            class="modal fade show"
            aria-modal="true"
            style="display: block; padding-left: 0px;"
          >
            <div class="modal-dialog modal-sm modal-dialog-centered">
              <span tabindex="0"></span>
              <div
                id="9j03d3vqv___BV_modal_content_"
                tabindex="-1"
                class="modal-content"
              >
                <div id="9j03d3vqv___BV_modal_body_" class="modal-body">
                  <div class="dialog_message">Give a name to the Exclusion List and Vault category</div>
                </div>
                <div class="v-input form-control m-textarea g-input unlimsize mb-0 v-textarea v-textarea--auto-grow v-textarea--no-resize v-input--hide-details theme--light v-text-field v-text-field--is-booted v-text-field--enclosed v-text-field--outlined v-text-field--placeholder">
                  <div class="v-input__control">
                    <div class="v-input__slot">
                      <fieldset aria-hidden="true">
                        <legend style="width: 0px;">
                          <span class="notranslate">&ZeroWidthSpace;</span>
                        </legend>
                      </fieldset>
                      <div class="v-text-field__slot">
                        <input
                          id="thrift-name-entry"
                          maxlength="200"
                          placeholder="XX MMDDYY Name"
                          style="height: 25px;"
                        ></input>
                      </div>
                    </div>
                  </div>
                </div>
                <footer id="9j03d3vqv___BV_modal_footer_" class="modal-footer">
                <button
                  id="thrift-close"
                  type="button"
                  class="g-btn m-flat m-btn-gaps m-reset-width"
                >
                  Cancel
                </button>
                ${
                  skip
                    ? `<button
                    id="thrift-entry-skip"
                    class="g-btn m-flat m-btn-gaps m-reset-width"
                  >
                    Skip Exclusion
                  </button>`
                    : ''
                }
                <button
                  id="${skip ? 'thrift-entry-new-next' : 'thrift-entry-next'}"
                  class="g-btn m-flat m-btn-gaps m-reset-width"
                  data-index=${index}
                >
                  Next
                </button>
              </footer>
              </div>
              <span tabindex="0"></span>
            </div>
          </div>
          <div id="9j03d3vqv___BV_modal_backdrop_" class="modal-backdrop"></div>
        </div>`

  document.body.appendChild(modal)

  const input = document.querySelector('#thrift-name-entry')

  if (input) {
    input.value = 'XX MMDDYY Name'
  }
}

const insertExclusionListSelector = (list_arg, index) => {
  const modal = document.createElement('div')
  modal.id = 'thrift-modal'
  modal.innerHTML = `
    <div style="position: absolute; z-index: 1040;">
    <div role="dialog" aria-describedby="ModalUsersLists___BV_modal_body_" class="modal fade show b-rows-lists__modal" style="display: block; padding-left: 0px;" aria-modal="true">
      <div class="modal-dialog modal-md modal-dialog-centered">
          <!---->
          <div id="ModalUsersLists___BV_modal_content_" tabindex="-1" class="modal-content">
            <header id="ModalUsersLists___BV_modal_header_" class="modal-header g-border-bottom m-autocomplete-search">
                <h4 data-v-c032a3c0="" class="modal-title">Select exclusion list</h4>

                <div class="b-search-form__wrapper-autocomplete">
                  <input type="search" id="thrift-selector-search" maxlength="100" spellcheck="false" autocorrect="off" autocomplete="off" autocapitalize="off" placeholder="Search..." name="media_vault_search" class="b-search-form__inputb-search-form__input form-control"><!---->
                  <div tabindex="-1" class="b-search-autocomplete" style="display: none;">
                      <!---->
                      <div class="b-search-autocomplete__scroller m-native-custom-scrollbar m-scrollbar-y">
                        <!---->
                        <div class="empty-message m-light-text m-show"> Try searching for media </div>
                      </div>
                  </div>
                </div>

                <div data-v-c032a3c0="" class="modal-header__btns-group m-move-right">
                  <button data-v-c032a3c0="" type="button" class="g-btn m-icon m-icon-only m-gray m-sm-size m-with-round-hover ml-0">
                      <svg data-v-c032a3c0="" data-icon-name="icon-search" aria-hidden="true" class="g-icon">
                        <use href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401261612-c78bf4ac03#icon-search" xlink:href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401261612-c78bf4ac03#icon-search"></use>
                      </svg>
                  </button>
                </div>
            </header>
            <div id="modal-selector-body" class="modal-body m-reset-body-padding-top m-reset-body-padding-bottom">
                <div data-v-9b86b1d2="" data-v-c032a3c0="" at-attr="" class="b-rows-lists m-collections-list m-native-custom-scrollbar m-scrollbar-y m-invisible-scrollbar g-sides-l-gap g-negative-sides-gaps">
                  ${formSelectorItems(list_arg, index)}
                 
                  <div data-v-cea4dd88="" data-v-c032a3c0="" class="infinite-loading-container" data-v-9b86b1d2="">
                      <div data-v-cea4dd88="" class="infinite-status-prompt" style="display: none;">
                        <div data-v-5096a190="" data-v-c032a3c0="" class="b-posts_preloader m-gaps" data-v-cea4dd88="">
                            <svg data-v-5096a190="" data-icon-name="icon-loading" aria-hidden="true" class="g-icon">
                              <use href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401261612-c78bf4ac03#icon-loading" xlink:href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401261612-c78bf4ac03#icon-loading"></use>
                            </svg>
                        </div>
                      </div>
                      <div data-v-cea4dd88="" class="infinite-status-prompt" style="display: none;">
                        <div data-v-c032a3c0="" data-v-cea4dd88=""></div>
                      </div>
                      <div data-v-cea4dd88="" class="infinite-status-prompt" style="display: none;">
                        <div data-v-cea4dd88=""></div>
                      </div>
                      <div data-v-cea4dd88="" class="infinite-status-prompt" style="color: rgb(102, 102, 102); font-size: 14px; padding: 10px 0px; display: none;">
                        <div data-v-cea4dd88=""></div>
                      </div>
                  </div>
                </div>
            </div>
            <footer class="modal-footer g-border-top">
              <button id="thrift-close" type="button" class="g-btn m-flat m-btn-gaps m-reset-width"> Close </button>
            </footer>
          </div>
          <!---->
      </div>
    </div>
    <div id="ModalUsersLists___BV_modal_backdrop_" class="modal-backdrop"></div>
  </div>`

  document.body.appendChild(modal)
}

const createExclusionList = async name => {
  const url = `/api2/v2/lists`

  try {
    const authParams = await getAuthParams(url)

    const data = await axios.post(
      `https://onlyfans.com${url}`,
      {
        name
      },
      { headers: authParams }
    )

    return data?.data
  } catch (error) {
    console.log('error', error)

    return Promise.reject(error)
  }
}

const findExclusionList = async query => {
  const url = `/api2/v2/lists?query=${encodeURIComponent(
    query
  )}&offset=0&skip_users=all&limit=100&format=infinite`

  try {
    const authParams = await getAuthParams(url)

    const data = await axios.get(`https://onlyfans.com${url}`, {
      headers: authParams
    })

    return data?.data?.list
  } catch (error) {
    console.log('error', error)

    return Promise.reject(error)
  }
}

const getUserLists = async (params = {}) => {
  const { offset = 0, query } = params

  const url = `/api2/v2/lists?query=${encodeURIComponent(
    query || ''
  )}&offset=${offset}&skip_users=all&limit=100&format=infinite`

  try {
    const authParams = await getAuthParams(url)

    const data = await axios.get(`https://onlyfans.com${url}`, {
      headers: authParams
    })

    return data?.data?.list
  } catch (error) {
    console.log('error', error)

    return Promise.reject(error)
  }
}

const getExclusionList = async ({ listId, offset = 0 }) => {
  const url = `/api2/v2/lists/${listId}/users?offset=${
    offset * 100
  }&limit=1000&format=infinite`

  try {
    const authParams = await getAuthParams(url)

    const data = await axios.get(`https://onlyfans.com${url}`, {
      headers: authParams
    })

    return data?.data
  } catch (error) {
    console.log('error', error)

    return Promise.reject(error)
  }
}

const getExclusionListInfo = async ({ listId }) => {
  const url = `/api2/v2/lists/${listId}`

  try {
    const authParams = await getAuthParams(url)

    const data = await axios.get(`https://onlyfans.com${url}`, {
      headers: authParams
    })

    return data?.data
  } catch (error) {
    console.log('error', error)

    return Promise.reject(error)
  }
}

// const deleteExclusionList = async (id) => {
//   const url = `/api2/v2/lists/${id}`

//   try {
//     const authParams = await getAuthParams(url)

//     await axios.delete(`https://onlyfans.com${url}`, {
//       headers: authParams
//     })
//   } catch (error) {
//     console.log('error', error)

//     return Promise.reject(error)
//   }
// }

const unsendMessage = async id => {
  const url = `/api2/v2/messages/queue/${id}`

  try {
    const authParams = await getAuthParams(url)

    await axios.delete(`https://onlyfans.com${url}`, {
      headers: authParams
    })
  } catch (error) {
    console.log('error', error)

    return Promise.reject(error)
  }
}

const addUsersToExclusionList = async (id, userIds, throwError) => {
  const url = `/api2/v2/lists/users`

  try {
    const authParams = await getAuthParams(url)

    await axios.post(
      `https://onlyfans.com${url}`,
      {
        [id]: userIds
      },
      { headers: authParams }
    )
  } catch (error) {
    if (throwError) {
      return Promise.reject(error)
    }

    const errorPayload = error?.response?.data?.errors?.[id]

    if (errorPayload) {
      const failedIds = Object.keys(errorPayload)

      return failedIds?.map(item => +item)
    }
  }
}

const getRecentMessage = async isScheduled => {
  try {
    const url = `/api2/v2/messages/queue/stats?limit=1&offset=0&format=infinite${
      isScheduled ? '&type=scheduled' : ''
    }`

    try {
      const authParams = await getAuthParams(url)

      const data = await axios.get(`https://onlyfans.com${url}`, {
        headers: authParams
      })

      return data?.data?.list?.[0]
    } catch (error) {
      console.log('error', error)

      return Promise.reject(error)
    }
  } catch (error) {
    console.log('error', error)
  }
}

const getMessageData = async id => {
  try {
    const url = `/api2/v2/messages/queue/${id}?format=scheduled`

    try {
      const authParams = await getAuthParams(url)

      const data = await axios.get(`https://onlyfans.com${url}`, {
        headers: authParams
      })

      return data?.data
    } catch (error) {
      console.log('error', error)

      return Promise.reject(error)
    }
  } catch (error) {
    console.log('error', error)
  }
}

const performReThrifting = async index => {
  try {
    resetSteps()
    updateStep(0)

    const usersList = await getUserLists()

    let initialList = usersList

    insertExclusionListSelector(initialList, index)

    const searchInput = document.getElementById('thrift-selector-search')

    searchInput.addEventListener('input', async e => {
      const value = e.target.value

      try {
        let result = []

        if (!value) {
          result = initialList
        } else {
          result = await findExclusionList(value)
        }

        const body = document.getElementById('modal-selector-body')

        const newElements = formSelectorItems(result, index)

        body.innerHTML = `<div data-v-9b86b1d2="" data-v-c032a3c0="" at-attr="" class="b-rows-lists m-collections-list m-native-custom-scrollbar m-scrollbar-y m-invisible-scrollbar g-sides-l-gap g-negative-sides-gaps">${newElements}</div>`

        handleScroll(initialList, index)
      } catch (error) {
        console.log('error', error)
      }
    })

    handleScroll(initialList, index)
  } catch (error) {
    console.log('error - performReThrifting', error)
  }
}

const handleScroll = (initialList, index) => {
  const scrollContainer = document.querySelector(
    '.b-rows-lists.m-collections-list'
  )

  scrollContainer.addEventListener('scrollend', async () => {
    if (
      scrollContainer?.offsetHeight + scrollContainer?.scrollTop + 20 >=
      scrollContainer?.scrollHeight
    ) {
      const body = document.querySelector(
        '.b-rows-lists.m-collections-list.m-native-custom-scrollbar.m-scrollbar-y.m-invisible-scrollbar.g-sides-l-gap.g-negative-sides-gaps'
      )

      body.insertAdjacentHTML(
        'beforeend',
        `<div id="icon-loading" data-v-5096a190="" data-v-c032a3c0="" class="b-posts_preloader m-gaps" data-v-cea4dd88="">
      <svg data-v-5096a190="" data-icon-name="icon-loading" aria-hidden="true" class="g-icon">
        <use href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401261612-c78bf4ac03#icon-loading" xlink:href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401261612-c78bf4ac03#icon-loading"></use>
      </svg>
  </div>`
      )

      const searchInput = document.getElementById('thrift-selector-search')

      const usersListOffset = await getUserLists({
        offset: initialList?.length,
        query: searchInput?.value
      })

      initialList = [...initialList, ...usersListOffset]

      const newElements = formSelectorItems(usersListOffset, index)

      body.insertAdjacentHTML('beforeend', newElements)

      const loader = document.getElementById('icon-loading')

      if (loader) {
        loader.remove()
      }
    }
  })
}

const formSelectorItems = (items, index) => {
  return items
    ?.map(
      item => `
      <label id="thrift-selector-item" data-index="${index}" data-name="${item?.name}" data-listid="${item?.id}" class="b-rows-lists__item__label m-collection-item g-radio-container" data-v-9d5bf552="" data-v-c032a3c0=""data-v-9b86b1d2="">
        <input id="uid-1667" type="checkbox" name="" class="b-input-radio" value="false">
        <span class="b-input-radio__label">
          <svg data-icon-name="icon-done" aria-hidden="true" class="g-icon">
              <use href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401261612-c78bf4ac03#icon-done" xlink:href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401261612-c78bf4ac03#icon-done"></use>
          </svg>
        <span class="b-input-ripple"></span>
        </span>
        <a data-v-c032a3c0="" href="/my/collections/user-lists/1059992423" class="b-rows-lists__item m-with-rectangle-hover m-tb-sm m-border-full-width">
          <div class="b-rows-lists__item__text">
              <div at-attr="lists_item" class="b-rows-lists__item__name g-text-ellipsis"> ${item?.name} </div>
              <div at-attr="user_count" class="b-rows-lists__item__count g-text-ellipsis"><span class="b-rows-lists__item__count__el"> ${item?.usersCount} user(s) </span><span class="b-rows-lists__item__count__el"> ${item?.postsCount} post(s) </span></div>
          </div>
        </a>
        </label>
      `
    )
    .join('')
}

const createScheduledMessage = async data => {
  const url = `/api2/v2/messages/queue`

  try {
    const authParams = await getAuthParams(url)

    const message = await axios.post(
      `https://onlyfans.com${url}`,
      {
        excludedLists: data?.excludedLists,
        isCouplePeopleMedia: false,
        isForward: false,
        isScheduled: 1,
        lockedText: false,
        mediaFiles: data?.media,
        previews: data?.previews,
        price: data?.price,
        scheduledDate: data?.scheduledDate,
        text: decodeHTMLEntities(data?.text),
        userLists: data?.userLists,
        releaseForms: data?.releaseForms,
        rfTag: data?.releaseForms?.map(item => item?.id)
      },
      { headers: authParams }
    )

    updateStep(3)

    setTimeout(() => {
      setSuccessMessage()

      setTimeout(() => {
        removeStatusWindow()
        resetSteps()

        window.open(
          `https://onlyfans.com/my/chats/send?scheduleMessageId=${message?.data?.id}&thrift=true`
        )

        const entry = document.querySelector('#thrift-entry')

        if (entry && entry?.remove) {
          entry.remove()
        }
      }, 1000)
    }, 1000)
  } catch (error) {
    console.log('error', error)

    return Promise.reject(error)
  }
}

async function insertElements() {
  try {
    startInitialize()

    const { list: items, hasMore: initialHasMore } = await getStatsList({
      offset: 0
    })

    sentList = items

    list = sentList

    insertHeading()
    insertRows()

    handleThriftClick()

    runThriftObserver()

    getInitialUnsentList()

    finishInitialize()

    let finish = !initialHasMore
    let index = 1

    while (!finish && !isUnsentTab) {
      const { list: new_items, hasMore } = await getStatsList({ offset: index })

      finish = !hasMore
      index = index + 1

      sentList = [...sentList, ...new_items]

      list = [...sentList, ...new_items]

      finishInitialize()

      startInitialize(
        `Ready to thrift messages until ${dayjs(
          sentList?.slice(-1)?.[0]?.date
        ).format('MMM D, YYYY h:mm a')}`,
        true
      )
    }

    list = sentList

    finishInitialize()

    unsentList = await getFullList(getStatsList, { type: 'unsent' })
  } catch (error) {
    alert('Unable to initialize thrifting script. Please try again.')
  }
}

const getInitialUnsentList = async () => {
  const list1 = await getStatsList({ offset: 0, type: 'unsent' })
  unsentList = list1?.list

  const list2 = await getStatsList({ offset: 100, type: 'unsent' })
  unsentList = [...(unsentList || []), ...(list2?.list || [])]
}

const startInitialize = (
  text = 'Initializing thrifting script...',
  noLoader
) => {
  const modal = document.createElement('div')
  modal.id = 'thrift-initialize'
  modal.innerHTML = `<div class="modal-content">
        <div class="modal-heading">
          <strong>
          ${
            !noLoader
              ? `<div id="icon-loading" data-v-5096a190="" data-v-c032a3c0="" class="b-posts_preloader m-gaps" data-v-cea4dd88="">
          <svg data-v-5096a190="" data-icon-name="icon-loading" aria-hidden="true" class="g-icon">
            <use href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401261612-c78bf4ac03#icon-loading" xlink:href="/theme/onlyfans/spa/icons/sprite.svg?rev=202401261612-c78bf4ac03#icon-loading"></use>
          </svg>
        </div>`
              : ''
          }
          ${text}
          </strong>
        </div>
      </div>`

  document.body.appendChild(modal)
}

const finishInitialize = () => {
  const modal = document.querySelector('#thrift-initialize')

  if (modal) {
    modal.remove()
  }
}
