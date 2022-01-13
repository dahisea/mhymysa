import { v3 as uuidv3 } from 'uuid'

const NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'

export function deviceId(cookie) {
    return uuidv3(cookie, NAMESPACE_URL).replace(/\-/g, '').toUpperCase()
}