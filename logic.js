import {
  TIMER_MIN_MINUTES,
  TIMER_RANDOM_PART_MINUTES,
  LIKE_PAUSE_MINUTES,
  LIKE_PAUSE_RANDOM_PART_MINUTES,
  STATISTIC_LINK,
  TABID,
  STATE,
  POSITION,
  LIST,
  USER,
  SUBSCRIBE_PAUSE_MINUTES,
  SUBSCRIBE_PAUSE_RANDOM_PART_MINUTES,
  GROUP
} from './constants.js'

import { loadNewList } from './loader.js'

import { likeVideoInjection } from './likeinjection.js'

function randomInMS (fix, rnd) {
  return Math.floor((fix + Math.random() * rnd) * 60 * 1000)
}

async function likeManager (tabId) {
  setTimeout(
    () =>
      chrome.scripting
        .executeScript({
          target: {
            tabId: tabId
          },
          func: likeVideoInjection,
          args: [
            randomInMS(LIKE_PAUSE_MINUTES, LIKE_PAUSE_RANDOM_PART_MINUTES),
            randomInMS(
              SUBSCRIBE_PAUSE_MINUTES,
              SUBSCRIBE_PAUSE_RANDOM_PART_MINUTES
            )
          ]
        })
        .catch(() =>
          console.log(
            'Не получилось внедрить скрипт в страницу, вероятно, она закрыта.'
          )
        ),
    3000
  )
}

export function sendToSheet (user, percent, group) {
  return fetch(STATISTIC_LINK)
    .then(resp => resp.text())
    .then(link =>
      fetch(link, {
        method: 'POST',
        body: JSON.stringify({
          user: user,
          progress: percent,
          group: group
        })
      })
    )
    .catch(e => console.log('Ошибка отправки статистики', e))
}

async function getUser (percent, extensionId) {
  document.querySelector('yt-img-shadow').click()
  let user = await new Promise((resolve, reject) => {
    setTimeout(
      () => resolve(document.querySelector('#account-name').innerText),
      1000
    )
  })
  console.log(extensionId, { user, percent })
  await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      extensionId,
      { user: user, percent: percent },
      res => resolve(true)
    )
  })
  return user
}

async function sendStat () {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([POSITION, LIST, USER, GROUP], result => {
      const pos = result.POSITION + 1
      const len = result.LIST.length
      let percent = Math.round((100 * pos) / len)
      if (pos % 50 == 0 || pos == len) {
        sendToSheet(result.USER, percent, result.GROUP)
      }
      resolve(true)
    })
  })
}

export function updateInterface () {
  chrome.runtime.sendMessage('updateInterface')
}

chrome.alarms.onAlarm.addListener(alrm => {
  //   console.log('alrm', alrm)
  sendStat().then(() => opener())
})

export function opener () {
  chrome.storage.local.get([TABID], val => {
    const tabId = val.TABID
    if (tabId) {
      chrome.storage.local.get([POSITION, LIST], result => {
        let toPlay =
          (result.POSITION !== 'undefined' ? result.POSITION : -1) + 1
        const list = result.LIST
        if (toPlay < list.length) {
          chrome.tabs
            .update(tabId, {
              url: list[toPlay]
            })
            .then(async () => {
              //   console.log(tabId, toPlay, list)
              likeManager(tabId)

              const timer =
                TIMER_MIN_MINUTES + Math.random() * TIMER_RANDOM_PART_MINUTES

              // console.log('timer', timer)
              chrome.alarms.create('nextVideo', { delayInMinutes: timer })
              if (toPlay == list.length - 1) {
                await loadNewList()
              }
              chrome.storage.local.set(
                {
                  POSITION: toPlay
                },
                updateInterface
              )
            })
            .catch(err => {
              console.log('Вероятно, вкладка с видео закрыта')
              console.log(err)
            })
        } else {
          stopPlay()
          chrome.notifications.create(null, {
            title: 'BeatBoost',
            message: 'Список просмотра кончился, мы его скоро обновим.',
            type: 'basic',
            iconUrl: 'icon.png',
            silent: true
          })
        }
      })
    }
  })
}

export async function getState () {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(STATE, result => {
      //   console.log('result.STATE ', result)
      resolve(result.STATE || 'pause')
    })
  })
}

export function stateChangeIfClosed (tabId, removeInfo) {
  chrome.storage.local.get(TABID, val => {
    if (val.TABID == tabId) {
      pausePlaying()
    }
  })
}

function pausePlaying () {
  chrome.storage.local.set({ TABID: null, STATE: 'pause' }, updateInterface)
}

export function stopPlay () {
  chrome.storage.local.get(TABID, val => {
    if (val.TABID) {
      chrome.tabs
        .remove(val.TABID)
        .catch(() => console.log('Вкладка уже закрыта'))
    }
    pausePlaying()
  })
}

export function startPlay () {
  return loadNewList()
    .then(() => chrome.tabs.create({}))
    .then(tab => {
      chrome.storage.local.set({ TABID: tab.id, STATE: 'play' }, opener)
    })
}
