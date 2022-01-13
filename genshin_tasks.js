/**
 * 参考：https://github.com/Womsxd/AutoMihoyoBBS/blob/master/mihoyobbs.py
 * 感谢🙇 @Womsxd
 */
import superagent from 'superagent'
import { createDS } from './utils/ds.js'
import { randomString } from './utils/random_str.js'
import { deviceId } from './utils/device_id.js'
import random_sleep from './utils/random_sleep.js'

const headers = {
    "DS": createDS(),
    "x-rpc-client_type": "2",  // 1为ios 2为安卓
    "x-rpc-app_version": "2.7.0",  // Slat和Version相互对应
    "x-rpc-sys_version": "6.0.1",
    "x-rpc-channel": "mihoyo",
    "x-rpc-device_name": randomString(Math.floor(Math.random()*10+1)),
    "x-rpc-device_model": "Mi 10",
    "Referer": "https://app.mihoyo.com",
    "Host": "bbs-api.mihoyo.com",
    "User-Agent": "okhttp/4.8.0"
}

/**
 * 任务计划表
 * @see https://github.com/Womsxd/AutoMihoyoBBS/blob/master/mihoyobbs.py#L32
 */
let toDoList = {
    "bbs_sign": false,
    "bbs_read_posts": false,
    "bbs_read_posts_num": 3,
    "bbs_like_posts": false,
    "bbs_like_posts_num": 5,
    "bbs_share": false
}

/**
 * 获取任务列表
 * @see https://github.com/Womsxd/AutoMihoyoBBS/blob/master/mihoyobbs.py#L48
 */
async function getTaskList(cookie) {
    const response = await superagent
        .get('https://bbs-api.mihoyo.com/apihub/sapi/getUserMissionsState')
        .set('cookie', cookie)
        .set('x-rpc-device_id', deviceId(cookie))
        .set(headers)
        .send()

    const { body } = response
    if (body?.message !== 'OK') {
        throw new Error('获取任务列表失败，cookie可能已经过期了')
    }
    const { can_get_points, total_points, already_received_points } = body.data
    console.log(`你共有${total_points}米游币，今天还可以获得${can_get_points}个米游币，已经获取了${already_received_points}个`)
    if (can_get_points === 0) {
        toDoList["bbs_sign"] = true
        toDoList["bbs_read_posts"] = true
        toDoList["bbs_like_posts"] = true
        toDoList["bbs_share"] = true
    }
    const { states } = body.data
    // 更新今日任务的完成状态
    for (const mission of states) {
        // 58是讨论区签到
        if (mission.mission_id === 58) {
            if (mission.is_get_award) {
                toDoList.bbs_sign = true
            }
        }
        // 59是看帖子
        else if (mission.mission_id === 59) {
            if (mission.is_get_award) {
                toDoList.bbs_read_posts = true
            } else {
                toDoList.bbs_read_posts_num -= mission.happened_times
            }
        }
        // 60是给帖子点赞
        else if (mission.mission_id === 60) {
            if (mission.is_get_award) {
                toDoList.bbs_like_posts = true
            } else {
                toDoList.bbs_like_posts_num -= mission.happened_times
            }
        }
        // 61是分享帖子
        else if (mission.mission_id === 61) {
            if (mission.is_get_award) {
                toDoList.bbs_share = true
                // 分享帖子，是最后一个任务，到这里了下面都是一次性任务，直接跳出循环
                break
            }
        }
    }

    return {
        canGetPoints: can_get_points,
        totalPoints: total_points
    }
}

/**
 * 讨论区签到
 * @see https://github.com/Womsxd/AutoMihoyoBBS/blob/master/mihoyobbs.py#L112
 */
async function signing(cookie) {
    if (toDoList.bbs_sign) {
        return console.log('讨论区任务已经完成过了~')
    }
    console.log('正在签到...')
    const response = await superagent
        .post('https://bbs-api.mihoyo.com/apihub/sapi/signIn?gids=2')       // 关于gids参数的参考：https://github.com/Womsxd/AutoMihoyoBBS/blob/9dcb3f0f4eda9ca37a07f97cb446b712bb4200b9/setting.py#L18-L21
        .set('cookie', cookie)
        .set('x-rpc-device_id', deviceId(cookie))
        .set(headers)
        .send({})
    
    const { body } = response
    if (body.message === 'OK') {
        const { points } = body.data
        return console.log(`签到成功，已获得${points}个米游币～`)
    } else {
        return console.log(`签到失败：${data.message}`)
    }
}

/**
 * 看贴子
 */
async function readPosts(cookie, posts) {
    if (toDoList.bbs_read_posts) {
        return console.log('看帖任务已经完成过了~')
    }
    console.log('正在看帖...')
    for (let i = 0; i < toDoList.bbs_read_posts_num; i++) {
        const { post_id, subject } = posts[i]
        const response = await superagent
            .get(`https://bbs-api.mihoyo.com/post/api/getPostFull?post_id=${post_id}`)
            .set('cookie', cookie)
            .set('x-rpc-device_id', deviceId(cookie))
            .set(headers)
            .send()
        const { message } = response.body
        if (message === 'OK') {
            console.log(`看帖 ${post_id} 成功: ${subject}`)
            await random_sleep(2, 8)
        }
    }
    console.log('已完成看帖任务')
}

/**
 * 点赞
 */
async function likePosts(cookie, posts) {
    if(toDoList.bbs_like_posts) {
        return console.log('点赞任务已经完成过了~')
    }
    console.log('正在点赞...')
    for (let i = 0; i < toDoList.bbs_like_posts_num; i++) {
        const { post_id, subject } = posts[i]
        const response = await superagent
            .post('https://bbs-api.mihoyo.com/apihub/sapi/upvotePost')
            .set('cookie', cookie)
            .set('x-rpc-device_id', deviceId(cookie))
            .set(headers)
            .send({
                post_id,
                is_cancel: false
            })
        const { message } = response.body
        if (message === 'OK') {
            console.log(`点赞 ${post_id} 成功: ${subject}`)
            await random_sleep(2, 8)
        }
    }
    console.log('已完成点赞任务')
}

/**
 * 分享帖子
 */
async function sharePost(cookie, posts) {
    if (toDoList.bbs_share) {
        return console.log('分享任务已经完成过了~')
    }
    console.log('正在分享帖子...')
    for (let i = 0; i < 3; i++) {
        const { post_id, subject } = posts[0]
        const response = await superagent
            .get(`https://bbs-api.mihoyo.com/apihub/api/getShareConf?entity_id=${post_id}&entity_type=1`)
            .set('cookie', cookie)
            .set('x-rpc-device_id', deviceId(cookie))
            .set(headers)
            .send()
        const { message } = response.body
        if (message === 'OK') {
            console.log(`分享 ${post_id} 成功：${subject}`)
            break
        } else {
            console.log(`分享任务执行失败，正在执行第${i+1}次，共3次`)
            await random_sleep(2, 8)
        }
    }
    console.log('已完成帖子分享任务')
}

/**
 * 获取帖子列表
 * @see https://github.com/Womsxd/AutoMihoyoBBS/blob/master/mihoyobbs.py#L101
 */
async function getPostList(cookie) {
    console.log('正在获取帖子列表...')
    const response = await superagent
        .get(`https://bbs-api.mihoyo.com/post/api/getForumPostList?forum_id=26&is_good=false&is_hot=false&page_size=20&sort_type=1`)        // 原神的forum_id是26: https://github.com/Womsxd/AutoMihoyoBBS/blob/9dcb3f0f4eda9ca37a07f97cb446b712bb4200b9/setting.py#L19
        .set('cookie', cookie)
        .set('x-rpc-device_id', deviceId(cookie))
        .set(headers)
        .send()
    const { message, data } = response.body
    if (message === 'OK') {
        return data.list.slice(0, 5).map(item => ({
            post_id: item.post.post_id,
            subject: item.post.subject
        }))
    } else {
        console.log(`帖子列表获取失败：${message}`)
    }
}


/**
 * 执行任务
 */
async function doTask(cookie) {
    const toDoList_copy = { ...toDoList }
    await getTaskList(cookie)
    await signing(cookie)
    const posts = await getPostList(cookie)
    await readPosts(cookie, posts)
    await likePosts(cookie, posts)
    await sharePost(cookie, posts)
    toDoList = toDoList_copy
}

export default { doTask }