document.addEventListener('DOMContentLoaded', () => {
  try {
    const manData = chrome.runtime.getManifest()
    document.querySelector('.ver').textContent = `Версия: ${manData.version}`
    document.querySelector('.bb').textContent = `${manData.short_name}`
    document.querySelector(
      '#description'
    ).textContent = `${manData.description}`
  } catch (err) {
    console.log('ошибос версии и названий', err)
  }
  updateInterface()
  for (let butt of document.querySelectorAll('button')) {
    butt.addEventListener('click', () => buttonClicker(butt.id))
  }
})

function buttonClicker (id) {
  if (id) {
    chrome.runtime.sendMessage(id, response => responseTipical(response))
  } else {
    resetPlugin()
  }
}

function resetPlugin () {
  chrome.storage.sync.set({
    POSITION: -1,
    USER: '',
    LIST: []
  })
  showSelectedButton([])
  updateInterface()
}

function responseTipical (response) {
  if (response.success) {
    updateInterface()
  } else {
    console.log(response)
  }
}

function setUser () {
  setMessage(
    `Укажите ваше имя в поле ниже и нажмиnt Enter. ` +
      `Не менее 5 символов. ` +
      `Это обязательно. ` +
      `Изменить нельзя. `
  )
  let field = document.querySelector('input')
  field.hidden = false
  field.addEventListener('keyup', function (event) {
    if (event.key === 'Enter' || event.key.charCodeAt(13)) {
      validateName(field.value)
    }
  })
}

function validateName (user) {
  if (user.length < 5) {
    setMessage('Не менее 5 символов!! Изменить нельзя')
  } else {
    chrome.storage.sync.set(
      {
        USER: user
      },
      () => {
        document.querySelector('input').hidden = true
        updateInterface()
      }
    )
  }
}

function updateInterface () {
  let progressmessage = ''
  let progress = ''
  chrome.storage.sync.get(['POSITION', 'LIST', 'USER'], result => {
    console.log(result)
    let user = result.USER
    if (!user || user.length < 5) {
      setUser()
    } else {
      try {
        document.querySelector('.name').textContent = `Привет, ${user}`
        const pos = (result.POSITION !== 'undefined' ? result.POSITION : -1) + 1
        const len = (result.LIST && result.LIST.length) || 0
        progress += `Прогресс: ${pos} / ${len} ( ${len &&
          Math.round((100 * pos) / len)}% )`
        if (pos == 0) {
          showSelectedButton(['start'])
        } else {
          if (pos != len) {
            chrome.runtime.sendMessage('getState', state => {
              showSelectedButton([
                // 'restart',
                state == 'pause' ? 'continue' : 'pause'
              ])
            })
          } else {
            progressmessage += 'Все видео просмотрены'
            showSelectedButton(['restart'])
            chrome.runtime.sendMessage('updateList', response =>
              responseTipical(response)
            )
          }
        }
      } catch (err) {
        console.log('ошибос прогресса и кнопок', err)
        progressmessage +=
          'Произошла ошибка в интерфейсе, возможны проблемы.' +
          'Сообщите владельцу, опишите что делали.'
      }
      setMessage(progressmessage)
    }

    document.querySelector('#progress').textContent = progress
  })
}

function setMessage (message) {
  if (message.length > 0) {
    document.querySelector('#message').textContent = message
    document.querySelector('#message').hidden = false
  } else {
    document.querySelector('#message').hidden = true
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message == 'updateInterface') {
    updateInterface()
    sendResponse({ success: true })
  }
  return true
})

function showSelectedButton (butts) {
  for (butt of document.querySelectorAll('button')) {
    if (butts.indexOf(butt.id) != -1) {
      butt.hidden = false
    } else {
      butt.hidden = true
    }
  }
}
