export default {
  // MUTATIONS
  REQUEST_FAIL: 'REQUEST_FAIL',

  INIT_SUCCESS: 'INIT_SUCCESS',
  INIT_PENDING: 'INIT_PENDING',
  INIT_FAIL: 'INIT_FAIL',
  INIT_NEW_USER: 'INIT_NEW_USER',

  IDENTITY_GET_SUCCESS: 'IDENTITY_GET_SUCCESS',
  IDENTITY_LIST_SUCCESS: 'IDENTITY_LIST_SUCCESS',

  PROPOSAL_LIST_SUCCESS: 'PROPOSAL_LIST_SUCCESS',

  LOG_INFO: 'LOG_INFO',
  LOG_ERROR: 'LOG_ERROR',
  HEALTHCHECK_SUCCESS: 'HEALTHCHECK_SUCCESS',

  MYST_PROCESS_RUNNING: 'MYST_PROCESS_RUNNING',

  IDENTITY_UNLOCK_SUCCESS: 'IDENTITY_UNLOCK_SUCCESS',
  IDENTITY_UNLOCK_PENDING: 'IDENTITY_UNLOCK_PENDING',
  IDENTITY_UNLOCK_FAIL: 'IDENTITY_UNLOCK_FAIL',

  HIDE_REQ_ERR: 'HIDE_REQ_ERR',

  // mutation + action
  CONNECTION_STATUS: 'CONNECTION_STATUS',
  CONNECTION_STATUS_ALL: 'CONNECTION_STATUS_ALL',
  CONNECTION_IP: 'CONNECTION_IP',

  // ACTIONS
  IDENTITY_CREATE: 'IDENTITY_CREATE',
  IDENTITY_LIST: 'IDENTITY_LIST',
  IDENTITY_UNLOCK: 'IDENTITY_UNLOCK',

  PROPOSAL_LIST: 'PROPOSAL_LIST',

  CONNECT: 'CONNECT',
  DISCONNECT: 'DISCONNECT',
  STATUS_UPDATER_RUN: 'STATUS_UPDATER_RUN',

  SET_NAV_OPEN: 'SET_NAV',
  SET_NAV_VISIBLE: 'SET_NAV_VISIBLE',
  SET_VISUAL: 'SET_VISUAL',

  ERROR_IN_MAIN: 'ERROR_IN_MAIN',
  ERROR_IN_RENDERER: 'ERROR_IN_RENDERER',

  TERMS: 'TERMS'
}
