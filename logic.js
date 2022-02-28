import {
  TIMER_RANDOM_PART,
  LIKE_PAUSE_MINUTES,
  LIKE_PAUSE_RANDOM_PART_MINUTES,
  TABSID,
  TABSID_TIMER,
  STATE,
  POSITION,
  SETTINGS_PLAYLIST,
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

import { likeVideoInjection, getUser, openFirstVideo } from './injections.js'

function randomInMS(fix, rnd) {
  return Math.floor((fix + Math.random() * rnd) * 60 * 1000)
}

async function injectionsManager(tabId, account = false) {
  setTimeout(() => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: openFirstVideo
    })
      .then(() => setTimeout(() => {
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
          }).catch(() => console.log('Скрипт лайков не внедрился.'))
        setTimeout(() => { activate(tabId) }, Math.random() * 1500)

        if (account) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: getUser,
            args: [chrome.runtime.id]
          }).catch(() => console.log('Скрипт извлечения имени не внедрился.'))
        }
      }, 6000))
      .catch(() => console.log('Ошибка внедрения какого-то из скриптов'))
  }, 8000)
}

chrome.alarms.onAlarm.addListener(alrm => {
  sendStat().then(() => opener())
})

function activate(tabId) {
  return chrome.tabs.update(tabId, { active: true })
    .catch(err => {
      console.log('Не обновить состояние. Вероятно, вкладка с видео закрыта, id:', tabId)
    })
}


function activator(tabIdList, position = 0) {
  if (position < tabIdList.length) {
    const tabId = tabIdList[position]
    setTimeout(() => {
      activate(tabId)
      activator(tabIdList, position + 1)

    }, position ? 1500 : 5000)
  }
}


export function opener(account = false) {
  return chrome.storage.local.get([
    TABSID, POSITION, LIST,
    ACCOUNT, SETTINGS_PLAYLIST,
    // TABSID_TIMER
  ])
    .then(result => {
      const tabsId = result.TABSID
      if (tabsId) {
        let toPlay = (result.POSITION !== 'undefined' ? result.POSITION : -1) + 1
        const list = result.LIST
        if (toPlay < list.length) {
          const sett = result.SETTINGS_PLAYLIST

          // const timerMid = sett.TabsNumber * sett.StepIntervalMinutes / sett.StepVideosAllTab
          // let timer, timerNext
          // if ((timerMid * (1 + TIMER_RANDOM_PART)) > result.TABSID_TIMER) {
          //   timer = result.TABSID_TIMER
          //   timerNext = sett.StepIntervalMinutes
          // } else {
          //   timer = timerMid + (Math.random() - 0.5) * timerMid * TIMER_RANDOM_PART
          //   timerNext = (result.TABSID_TIMER || sett.StepIntervalMinutes) - timer
          // }
          // chrome.storage.local.set({ TABSID_TIMER: timerNext })

          const timer = sett.StepIntervalMinutes +
            (Math.random() - 0.5) * sett.StepIntervalMinutes * TIMER_RANDOM_PART
          account = account || !result.ACCOUNT
          for (let tabId of tabsId) {
            if (toPlay < list.length) {
              let openid = toPlay
              chrome.tabs.update(tabId, { url: list[openid], muted: true })
                .then(() => {
                  injectionsManager(tabId, account)
                  account = false
                  return chrome.storage.local.set({ POSITION: openid }, updateInterface)
                })
                .catch(err => {
                  console.log('Вероятно, вкладка с видео закрыта, id:', tabId)
                  console.log(err)
                  toPlay -= 1
                })
              toPlay += 1
              // Если список закончился
              if (toPlay == list.length - 1) { loadNewList() }
            }
          }

          // if (account) {
          // activator(tabsId)
          // }

          chrome.alarms.create('nextVideo', { delayInMinutes: timer })

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