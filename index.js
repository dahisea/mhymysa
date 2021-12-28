import genshin from './genshin.js'

const cookieKeys = Reflect
    .ownKeys(process.env)
    .filter(key => key.startsWith('SIGN_TARGET_COOKIE_'))

;(async () => {
    for (let key of cookieKeys) {
        console.log(`============================= 开始为${key}签到 =======================================`)
        try {
            await genshin.sign(process.env[key])
        } catch (error) {
            console.log(`${key}签到失败：${error.message}`)
        }
    }
})()