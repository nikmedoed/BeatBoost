import {
  GROUP,
  POSITION,
  LIST,
  SETTINGS,
  SETTINGS_PLAYLIST
} from './constants.js'

import { loadSettings } from './settings.js'

function getUserGroup() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(GROUP, val => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError)
      }
      return resolve(val.GROUP)
    })
  })
}

export async function loadNewList(notification = false) {
  const group = await getUserGroup()
  return loadSettings()
    .then(val => val.linksSheet)
    .then(link => fetch(`${link}?getLinks=${group}`))
    .then(response => response.json())
    .then(
      linksobject =>
        new Promise((resolve, reject) => {
          const list = linksobject.links
          chrome.storage.local.get([POSITION, LIST], result => {
            let position = -1
            let updated = false
            if (result.POSITION && result.POSITION >= 0) {
              position = list.indexOf(result.LIST[result.POSITION])
              updated = position > -1 && result.LIST[0] != list[0]
            }
            if (notification) {
              chrome.notifications.create(null, {
                title: 'BeatBoost - список просмотра',
                message: `${updated
                    ? 'Список обновился 👍🏻'
                    : '😧 На сервере нет новых ссылок для просмотра'
                  }`,
                type: 'basic',
                iconUrl: 'icon.png',
                silent: true
              })
            }
            const values = {
              POSITION: position,
              LIST: list,
              SETTINGS_PLAYLIST: linksobject.settings
            }
            chrome.storage.local.set(values, () => resolve(values))
          })
        })
    )
}

export async function loadGroups() {
  return loadSettings()
    .then(val => val.linksSheet)
    .then(link =>
      fetch(`${link}?getGroups=${Math.floor(Math.random() * 999999) + 100000}`)
    )
    .then(response => response.json())
    .then(groups => groups.groups)
}
