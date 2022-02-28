import {
  TABSID,
  STATE,
} from './constants.js'

import { loadNewList } from './loader.js'

import { opener } from './logic.js'

export function updateInterface() {
  chrome.runtime.sendMessage('updateInterface')
}


export async function getState() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(STATE, result => {
      resolve(result.STATE || 'pause')
    })
  })
}

export function stateChangeIfClosed(tabId, removeInfo) {
  chrome.storage.local.get(TABSID, val => {
    if (val.TABSID && val.TABSID.indexOf(tabId) !== -1) {
      stopPlay()
    }
  })
}

export function pausePlaying() {
  chrome.storage.local.set({
    TABSID: null,
    STATE: 'pause'
  }, updateInterface)
}

export function stopPlay() {
  chrome.storage.local.get(TABSID, val => {
    if (val.TABSID) {
      Promise.all(
        val.TABSID.map(tabId => chrome.tabs.remove(tabId)
          .catch(e => console.log('Вкладка уже закрыта', e)))
      )
    }
    pausePlaying()
  })
}

export function startPlay() {
  return loadNewList()
    .then(listData => Promise.all(
      Array(listData.SETTINGS_PLAYLIST.TabsNumber).fill(1)
        .map(e => chrome.tabs.create({}))
    ))
    .then(tabs => {
      return chrome.storage.local.set({
        TABSID: tabs.map(tab => tab.id),
        STATE: 'play'
      })
    }).then(() => opener(true))
}