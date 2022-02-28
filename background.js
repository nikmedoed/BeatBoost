import {
  stopPlay,
  startPlay,
  getState,
  stateChangeIfClosed
} from './controls.js'


import { loadNewList, loadGroups } from './loader.js'


async function reStartPlaying() {
  new Promise((resolve, reject) => {
    chrome.storage.local.set({ POSITION: -1 }, () =>
      startPlay()
        .then(() => resolve(true))
        .catch(() => resolve(false))
    )
  })
}


async function onEventHandler(message, sender, sendResponse) {
  try {
    switch (message) {
      case 'getState':
        let state = await getState()
        sendResponse(state)
        break
      case 'getGroups':
        let groups = await loadGroups()
        sendResponse(groups)
        break
      case 'restart': // Для разработки пригодится начинать сначала
      case 'updateList':
        let values = await loadNewList(message == 'restart')
        sendResponse({ success: values.POSITION < values.LIST.length - 1 })
        // })
        break
      // case 'restart': // убрать перед сборкой, если будет кнопка начать сначала
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
        sendResponse({ success: true })
        break
    }
  } catch (err) {
    console.error('Ошибка обработки вызовов на беке', err)
    sendResponse({ success: false })
  }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.account) {
    chrome.storage.local.set({ ACCOUNT: message.account })
  }
  onEventHandler(message, sender, sendResponse)
  return true
})

chrome.tabs.onRemoved.addListener(stateChangeIfClosed)

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.local.set({ STATE: 'pause' })
  loadNewList()
})
