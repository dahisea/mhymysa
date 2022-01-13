import genshin from './genshin_sign.js'

const cookieKeys = Reflect
    .ownKeys(process.env)
    .filter(key => key.startsWith('SIGN_TARGET_COOKIE_'))

;(async () => {
    for (let key of cookieKeys) {
        console.log(`============================= 开始为${key}签到 =======================================`)
        await genshin.sign(process.env[key])
    }
})()