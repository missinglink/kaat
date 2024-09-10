export default {
  // socket:application
  exit: () => { console.error('application:exit') },
  setSystemMenu: () => { console.error('application:setSystemMenu') },

  // socket:os
  platform: () => 'browser',

  // socket:path
  extname: () => '.xxx'
}

// socket:mime
export const includes = () => false
export const lookup = async () => null

// socket:network
import api from 'socket:api'
import dgram, { EventEmitter } from 'https://webudp.fly.dev/bundle.js'
export const network = options => api(options, { EventEmitter }, dgram)

// exports
export * as NAT from 'socket:nat'
export { Cache } from 'socket:cache'
export { Encryption } from 'socket:encryption'
export { Packet, sha256 } from 'socket:packets'

// add Buffer to global scope
import { Buffer } from 'socket:buffer'
globalThis.Buffer = Buffer