import md5 from 'md5'
import { randomString } from './random_str.js'

const mihoyobbs_salt = 'fd3ykrh7o1j54g581upo1tvpam0dsgtf'

function timestamp() {
    return Math.floor(Date.now() / 1000)
}

export function createDS() {
    const i = timestamp()
    const r = randomString(6)
    const c = md5(`salt=${mihoyobbs_salt}&t=${i}&r=${r}`)
    return `${i},${r},${c}`
}