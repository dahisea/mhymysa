import genshinTask from './genshin_tasks.js'

const cookieKeys = Reflect
    .ownKeys(process.env)
    .filter(key => key.startsWith('DAILY_TASK_COOKIE_'))

;(async () => {
    if (!cookieKeys.length) {
        return console.log('未传入目标cookie')
    }
    for (let key of cookieKeys) {
        console.log(`============================= 开始为${key}做每日任务 =======================================`)
        await genshinTask.doTask(process.env[key])
    }
})()