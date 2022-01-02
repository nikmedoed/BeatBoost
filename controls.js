import {
  TABID,
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
      //   console.log('result.STATE ', result)
      resolve(result.STATE || 'pause')
    })
  })
}

export function stateChangeIfClosed(tabId, removeInfo) {
  chrome.storage.local.get(TABID, val => {
    if (val.TABID == tabId) {
      pausePlaying()
    }
  })
}

export function pausePlaying() {
  chrome.storage.local.set({
    TABID: null,
    STATE: 'pause'
  }, updateInterface)
}

export function stopPlay() {
  chrome.storage.local.get(TABID, val => {
    if (val.TABID) {
      chrome.tabs
        .remove(val.TABID)
        .catch(() => console.log('Вкладка уже закрыта'))
    }
    pausePlaying()
  })
}

export function startPlay() {
  return loadNewList()
    .then(() => chrome.tabs.create({}))
    .then(tab => {
      return chrome.storage.local.set({
        TABID: tab.id,
        STATE: 'play'
      })
    }).then(() => opener(true))
}