export function likeVideoInjection (timeToLike, timeToSubscribe) {
  if (Math.random() > 0.5) {
    setTimeout(() => {
      document.querySelectorAll('ytd-toggle-button-renderer')[0].click()
      setTimeout(() => {
        let notifEl = document.querySelector(
          'yt-formatted-string#text.yt-notification-action-renderer'
        )
        const notifText = notifEl.innerText.toString()
        if (notifText.includes('Удалено') || notifText.includes('Deleted')) {
          document.querySelectorAll('ytd-toggle-button-renderer')[0].click()
        }
      }, 3000)
    }, timeToLike)
  }

  if (Math.random() > 0.8) {
    setTimeout(() => {
      subs = document.querySelectorAll('#subscribe-button')
      subs = subs[subs.length - 1].children[0].children[0]
      if (!subs.hasAttribute('subscribed')) {
        subs.click()
      }
    }, timeToSubscribe)
  }
}
