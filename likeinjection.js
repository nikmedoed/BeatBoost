export function likeVideoInjection (time) {
    setTimeout(() => {
      document.querySelectorAll('ytd-toggle-button-renderer')[0].click()
      // alert('Clicked')
      // const list = document.querySelectorAll('ytd-toggle-button-renderer')
      // const elem = list[list.length - 2]
      // if (!elem.classList.contains('style-default-active')) {
      //   elem.click()
      // }
    }, time)
  }
  