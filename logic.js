import {
  TIMER_MIN_MINUTES,
  TIMER_RANDOM_PART_MINUTES,
  LIKE_PAUSE_MINUTES,
  LIKE_PAUSE_RANDOM_PART_MINUTES,
  FILE_LINK,
  SHEET_API_LINK,
  TABID,
  STATE,
  POSITION,
  LIST,
  USER
} from './constants.js'

function likeVideoInjection (time) {
  setTimeout(() => {
    const list = document.querySelectorAll('ytd-toggle-button-renderer')
    const elem = list[list.length - 2]
    if (!elem.classList.contains('style-default-active')) {
      elem.click()
    }
  }, time)
}

async function likeManager (tabId) {
  if (Math.random() > 0.5) {
    // console.log('ShouldBeLiked')
    setTimeout(
      () =>
        chrome.scripting.executeScript({
          target: {
            tabId: tabId
          },
          func: likeVideoInjection,
          args: [
            Math.floor(
              LIKE_PAUSE_MINUTES +
                Math.random() * LIKE_PAUSE_RANDOM_PART_MINUTES * 60 * 1000
            )
          ]
        }),
      3000
    )
  }
}

// function sender () {
//   var port = chrome.runtime.connect({ name: 'knockknock' })
//   port.postMessage({
//     user: 'Никита Муромцев',
//     percent: 100
//   })
// }

export function sendToSheet (user, percent) {
  return fetch(SHEET_API_LINK, {
    method: 'POST',
    body: JSON.stringify({
      user: user,
      progress: percent
    })
  }).catch(e => console.log('Ошибка отправки статистики', e))
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
    chrome.storage.sync.get([POSITION, LIST, USER], result => {
      const pos = result.POSITION + 1
      const len = result.LIST.length
      let percent = Math.round((100 * pos) / len)
      sendToSheet(result.USER, percent)
      resolve(true)
      //   try {
      //     chrome.storage.local.get(TABID, val => {
      //       const tabId = val.TABID
      //       if (tabId) {
      //         chrome.scripting.executeScript(
      //           {
      //             target: { tabId: tabId },
      //             func: getUser,
      //             args: [percent, chrome.runtime.id]
      //           },
      //           user => {
      //             // console.log(user)
      //             setTimeout(() => resolve(true), 4000)
      //           }
      //         )
      //       }
      //     })
      //   } catch (err) {
      //     console.log('ошибка отправки статистики', err)
      //   }
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
      chrome.storage.sync.get([POSITION, LIST], result => {
        let toPlay =
          (result.POSITION !== 'undefined' ? result.POSITION : -1) + 1
        // Проверка доступности вкладки
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

              console.log('timer', timer)
              chrome.alarms.create('nextVideo', { delayInMinutes: timer })

              //   setTimeout(
              //     () => sendStat(toPlay, list.length, tabId).then(() => opener()),
              //     timer
              //   )
              if (toPlay == list.length - 1) {
                await loadNewList()
              }
              chrome.storage.sync.set(
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

export function stopPlay () {
  chrome.storage.local.get(TABID, val => {
    try {
      chrome.tabs.remove(val.TABID)
    } catch {}
    chrome.storage.local.set({ TABID: null, STATE: 'pause' }, updateInterface)
  })
}

export function startPlay () {
  return loadNewList()
    .then(() => chrome.tabs.create({}))
    .then(tab => {
      chrome.storage.local.set({ TABID: tab.id, STATE: 'play' }, opener)
    })
}

export async function loadNewList (notification = false) {
  return fetch(FILE_LINK)
    .then(response => response.text())
    .then(resp => resp.trim().split('\n'))
    .then(
      list =>
        new Promise((resolve, reject) => {
          chrome.storage.sync.get([POSITION, LIST], result => {
            let position = -1
            let updated = false
            if (result.POSITION && result.POSITION >= 0) {
              position = list.indexOf(result.LIST[result.POSITION])
              updated = position > -1 && result.LIST[0] != list[0]
            }
            if (notification) {
              chrome.notifications.create(null, {
                title: 'BeatBoost - список просмотра',
                message: `${
                  updated
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
              LIST: list
            }
            chrome.storage.sync.set(values, () => resolve(values))
          })
        })
    )
}
