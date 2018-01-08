import feathers from '@feathersjs/feathers'
import auth from '@feathersjs/authentication-client'
// BUG: https://github.com/feathersjs/feathers/issues/756
// import socketio from '@feathersjs/socketio-client'
// import io from 'socket.io-client'
// const socket = io('http://localhost:3030', {transports: ['websocket']})

// Connect to the same as the browser URL (only in the browser)
const rest = require('@feathersjs/rest-client')
// const restClient = rest()
const restClient = rest('http://localhost:3030')
const localstorage = require('feathers-localstorage')
const storage = require('localstorage-memory')

const api = feathers()
  // .configure(hooks())
  // .configure(socketio(socket))
  // .configure(auth({ storage: window.localStorage }))
  .use('storage', localstorage({storage: storage}))
  .configure(restClient.fetch(window.fetch))
  .configure(auth())

api.service('/users')
api.service('/workhours')
api.service('/projects')

export default api
