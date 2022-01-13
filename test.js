import genshinSign from './genshin_sign.js'
import genshinTask from './genshin_tasks.js'
import { genshin_sign_cookie, genshin_sapi_cookie } from './cookie.js'

;(async () => {
    // await genshinSign.sign(genshin_sign_cookie)
    await genshinTask.doTask(genshin_sapi_cookie)
})()