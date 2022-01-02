import {
  TIMER_MIN_MINUTES,
  TIMER_RANDOM_PART_MINUTES,
  LIKE_PAUSE_MINUTES,
  LIKE_PAUSE_RANDOM_PART_MINUTES,
  TABID,
  STATE,
  POSITION,
  LIST,
  ACCOUNT,
  USER,
  SUBSCRIBE_PAUSE_MINUTES,
  SUBSCRIBE_PAUSE_RANDOM_PART_MINUTES,
  GROUP
} from './constants.js'

import { loadNewList } from './loader.js'
import { sendStat } from './statistic.js'

import { stopPlay, updateInterface } from './controls.js'

import { likeVideoInjection, getUser } from './injections.js'

function randomInMS(fix, rnd) {
  return Math.floor((fix + Math.random() * rnd) * 60 * 1000)
}

async function injectionsManager(tabId, account = false) {
  setTimeout(() => {
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        func: likeVideoInjection,
        args: [
          randomInMS(LIKE_PAUSE_MINUTES, LIKE_PAUSE_RANDOM_PART_MINUTES),
          randomInMS(
            SUBSCRIBE_PAUSE_MINUTES,
            SUBSCRIBE_PAUSE_RANDOM_PART_MINUTES
          )
        ]
      })
      .catch(() => console.log('Не получилось внедрить скрипт в страницу, вероятно, она закрыта.'))
    if (account) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: getUser,
        args: [chrome.runtime.id]
      })
    }
  }, 3000)
}

chrome.alarms.onAlarm.addListener(alrm => {
  //   console.log('alrm', alrm)
  sendStat().then(() => opener())
})

export function opener(account = false) {
  return chrome.storage.local.get([TABID, POSITION, LIST, ACCOUNT])
    .then(result => {
      const tabId = result.TABID
      if (tabId) {
        let toPlay = (result.POSITION !== 'undefined' ? result.POSITION : -1) + 1
        const list = result.LIST
        if (toPlay < list.length) {
          chrome.tabs.update(tabId, { url: list[toPlay], muted: true })
            .then(async () => {
              //   console.log(tabId, toPlay, list)
              injectionsManager(tabId, account || !ACCOUNT)

              const timer = TIMER_MIN_MINUTES + Math.random() * TIMER_RANDOM_PART_MINUTES
              // console.log('timer', timer)
              chrome.alarms.create('nextVideo', { delayInMinutes: timer })
              // Если список закончился
              if (toPlay == list.length - 1) { await loadNewList() }
              chrome.storage.local.set({ POSITION: toPlay }, updateInterface)
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
      }
    })
}