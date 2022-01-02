import { POSITION, LIST, USER, GROUP, SETTINGS, ACCOUNT } from './constants.js'

export async function sendStat() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([POSITION, LIST], result => {
      const pos = result.POSITION + 1
      const len = result.LIST.length
      let percent = Math.round((100 * pos) / len)
      console.log("sendStat",  percent)
      if (pos % 50 == 0 || pos == len) {
        sendToSheet(percent)
      }
      resolve(true)
    })
  })
}

export function sendToSheet(percent) {
  return chrome.storage.local.get([SETTINGS, USER, GROUP, ACCOUNT])
    .then(result =>
      fetch(result.SETTINGS.statSheet, {
        method: 'POST',
        body: JSON.stringify({
          user: result.USER,
          progress: percent,
          group: result.GROUP,
          account : result.ACCOUNT
        })
      })
    )
    .catch(e => console.log('Ошибка отправки статистики', e))
}
