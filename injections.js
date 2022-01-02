export function likeVideoInjection(timeToLike, timeToSubscribe) {
  if (Math.random() > 0.5) {
    setTimeout(() => {
      let buttonclass =
        'ytd-toggle-button-renderer.style-scope.ytd-menu-renderer.force-icon-button'
      document.querySelectorAll(buttonclass)[0].click()
      setTimeout(() => {
        let notifEl = document.querySelector(
          'yt-formatted-string#text.yt-notification-action-renderer'
        )
        const notifText = notifEl.innerText.toString()
        if (notifText.includes('Удалено') || notifText.includes('Deleted')) {
          document.querySelectorAll(buttonclass)[0].click()
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


export async function getUser(extensionId) {
  setTimeout(
    async () => {
      document.querySelector('#avatar-btn').click()
      let user = await new Promise((resolve, reject) => {
        setTimeout(
          () => resolve(document.querySelector('#account-name').innerText),
          1000
        )
      })
      chrome.runtime.sendMessage(
        extensionId,
        { account: user },
        res => resolve(true)
      )
    },
    3000
  )
}
