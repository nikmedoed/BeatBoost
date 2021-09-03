import {
  loadNewList,
  stopPlay,
  startPlay,
  getState,
  sendToSheet
} from './logic.js'

async function reStartPlaying () {
  new Promise((resolve, reject) => {
    chrome.storage.sync.set({ POSITION: -1 }, () =>
      startPlay()
        .then(() => resolve(true))
        .catch(() => resolve(false))
    )
  })
}

async function onEventHandler (message, sender, sendResponse) {
  try {
    switch (message) {
      case 'getState':
        let state = await getState()
        // console.log('getState', state)
        sendResponse(state)
        break
      case 'restart': // Для разработки пригодится начинать сначала
      case 'updateList':
        let values = await loadNewList(message == 'restart')
        // console.log('values', values)
        sendResponse({ success: values.POSITION < values.LIST.length - 1 })
        // })
        break
      // case 'restart': // убрать перед сборкой
      case 'start':
        stopPlay()
        sendResponse({ success: await reStartPlaying() })
        break
      case 'pause':
        stopPlay()
        sendResponse({ success: true })
        break
      case 'continue':
        startPlay()
        // TODO научиться делать паузу не закрывая вкладку, но отслеживая закрытие
        sendResponse({ success: true })
        break
    }
  } catch (err) {
    console.error('Ошибка обработки вызовов на беке', err)
    sendResponse({ success: false })
  }
}

chrome.runtime.onMessageExternal.addListener(function (
  message,
  sender,
  sendResponse
) {
  // console.log(message)
  if (message.user) {
    sendToSheet(user, percent)
  }
  sendResponse('ok')
  return true
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  onEventHandler(message, sender, sendResponse)
  return true
})

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.local.set({ STATE: 'pause' })
  // chrome.storage.sync.set({ POSITION: -1 })
  // Сбросит статус у тех, кто обновляет, не надо
  loadNewList()
})
