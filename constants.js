const DEV = true

export const TIMER_RANDOM_PART = 0.2

export const LIKE_PAUSE_MINUTES = DEV ? 0.1 : 1
export const LIKE_PAUSE_RANDOM_PART_MINUTES = DEV ? 0 : 0.5

export const SUBSCRIBE_PAUSE_MINUTES = DEV ? 0.1 : 1
export const SUBSCRIBE_PAUSE_RANDOM_PART_MINUTES = DEV ? 0.05 : 1

export const GIST =
  'https://gist.githubusercontent.com/nikmedoed/0a196549628611b0cfe4c74f8f0322e6/raw/Settings'+ (DEV ? '_dev' : '')

export const TABSID = 'TABSID'
export const TABSID_TIMER = 'TABSID_TIMER'
export const STATE = 'STATE'
export const POSITION = 'POSITION'
export const LIST = 'LIST'
export const USER = 'USER'
export const GROUP = 'GROUP'
export const ACCOUNT = 'ACCOUNT'
export const SETTINGS = 'SETTINGS'
export const SETTINGS_PLAYLIST = 'SETTINGS_PLAYLIST'
