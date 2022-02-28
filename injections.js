export function likeVideoInjection(timeToLike, timeToSubscribe) {
  if (Math.random() > 0.5) {
    setTimeout(() => {
      try {
        let buttonclass =
          'ytd-toggle-button-renderer.style-scope.ytd-menu-renderer.force-icon-button'
        let butt = document.querySelectorAll(buttonclass)[0]
        if (!butt.classList.contains("style-default-active")) {
          butt.click()
        }
      } catch { console.log("Не получилось поставить лайк") }
    }, timeToLike)
  }

  if (Math.random() > 0.8) {
    setTimeout(() => {
      try {
        subs = document.querySelectorAll('#subscribe-button')
        subs = subs[subs.length - 1].children[0].children[0]
        if (!subs.hasAttribute('subscribed')) {
          subs.click()
        }
      } catch { console.log("Не получилось подписаться") }
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
        { account: user }
      ).catch((e) => { console.log("Не получилось отправить имя пользователя") })
    },
    3000
  )
}


export function openFirstVideo() {
  document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll("a#video-title")[0].click()
  })
  document.querySelectorAll("a#video-title")[0].click()
  return 1
}