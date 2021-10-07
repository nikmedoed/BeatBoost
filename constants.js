const DEV = true

export const TIMER_MIN_MINUTES = DEV ? 0.2 : 2
export const TIMER_RANDOM_PART_MINUTES = DEV ? 0 : 1

export const LIKE_PAUSE_MINUTES = DEV ? 0.1 : 1
export const LIKE_PAUSE_RANDOM_PART_MINUTES = DEV ? 0 : 0.5

export const SUBSCRIBE_PAUSE_MINUTES = DEV ? 0.1 : 1
export const SUBSCRIBE_PAUSE_RANDOM_PART_MINUTES = DEV ? 0.05 : 1

const GIST =
  'https://gist.githubusercontent.com/nikmedoed/0a196549628611b0cfe4c74f8f0322e6/raw/'

export const WATCHLINKS_LINK = GIST + 'Links' + (DEV ? '_dev' : '')
export const STATISTIC_LINK = GIST + 'Stat' + (DEV ? '_dev' : '')

export const TABID = 'TABID'
export const STATE = 'STATE'
export const POSITION = 'POSITION'
export const LIST = 'LIST'
export const USER = 'USER'
export const GROUP = 'GROUP'
