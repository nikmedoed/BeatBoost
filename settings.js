import { GIST, SETTINGS } from './constants.js'

function parseINIString (data) {
  var regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
    comment: /^\s*;.*$/
  }
  var value = {}
  var lines = data.split(/[\r\n]+/)
  var section = null
  lines.forEach(function (line) {
    if (regex.comment.test(line)) {
      return
    } else if (regex.param.test(line)) {
      var match = line.match(regex.param)
      if (section) {
        value[section][match[1]] = match[2]
      } else {
        value[match[1]] = match[2]
      }
    } else if (regex.section.test(line)) {
      var match = line.match(regex.section)
      value[match[1]] = {}
      section = match[1]
    } else if (line.length == 0 && section) {
      section = null
    }
  })
  return value
}

export function loadSettings (settingsLink = GIST) {
  
  return fetch(settingsLink)
    .then(resp => resp.text())
    .then(text => {
      const sett = parseINIString(text)
      let settings = {
        linksSheet: sett.SETTINGS.LINKS_SHEET,
        statSheet: sett.SETTINGS.STAT_SHEET
      }
      chrome.storage.local.set({ SETTINGS: settings }) 
      return settings
    })
}
