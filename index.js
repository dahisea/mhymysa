/**
 * 参考ios快捷指令：https://www.icloud.com/shortcuts/3a59037fbac0487e8e435efd529151ee
 * 感谢做好事不留名的大佬的分享🙏感谢！
 */

import fetch from 'node-fetch'
import cookie from './cookie.js'
import md5 from 'md5'

async function fetchWithCookie(url, init = {}) {
    return fetch(url, {
        ...init,
        headers: {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.3.0'
        },
        ...init.headers
    })
}

function error(content) {
    throw new Error(content)
}

function randomString(e) {    
    e = e || 32;
    var t = "abcdefghijklmnopqrstuvwxyz0123456789",
    a = t.length,
    n = "";
    for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}

// 获取游戏角色信息(小绿绿的账号信息)
async function getUserGameRolesByCookie() {
    const response = await fetchWithCookie('https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=hk4e_cn')
    const body = await response.json()
    if (body.retcode !== 0) {
        // 大佬判断到这里是按cookie已失效处理
        error(`[接口返回错误]: ${body.message}`)
    }
    const roles = body.data.list
    if (!roles || !roles.length) {
        error(`没有角色:\n${JSON.stringify(body.data.list, null, 2)}`)
    }
    return body.data.list.shift()
}

// 根据地区和uid获取签到奖励信息
async function getSignRewardInfo(region, uid) {
    const response = await fetchWithCookie(`https://api-takumi.mihoyo.com/event/bbs_sign_reward/info?region=${region}&act_id=e202009291139501&uid=${uid}`, {
        headers: {
            'Referer': 'https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=e202009291139501&utm_source=bbs&utm_medium=mys&utm_campaign=icon'
        }
    })
    const body = await response.json()
    if (body.retcode !== 0) {
        error(`[接口返回错误]: ${body.message}`) 
    }
    return body.data
}

// 签到
async function getSignReward(reqBody) {
    const timestamp = Math.floor(Date.now() / 1000)
    const randomeStr = randomString(6)
    const params = `salt=h8w582wxwgqvahcdkpvdhbh2w9casgfl&t=${timestamp}&r=${randomeStr}`
    console.log(`${timestamp},${randomeStr},${md5(params)}`);
    const response = await fetchWithCookie('https://api-takumi.mihoyo.com/event/bbs_sign_reward/sign', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=e202009291139501&utm_source=bbs&utm_medium=mys&utm_campaign=icon',
            'x-rpc-client_type': '5',
            'x-rpc-app_version': '2.3.0',
            'x-rpc-device_id': 'BILIBILISIPOSHANGKOUDIANBILIBILI',
            'DS': `${timestamp},${randomeStr},${md5(params)}`,
        },
        body: JSON.stringify(reqBody)
    })
    const body = await response.json()
    console.log(body)
    // if (body.retcode !== 0) {
    //     error(`[接口返回错误]: ${body.message}`)
    //     return
    // }
    // return body
}

(async () => {
    // 角色集合
    const { region, game_uid, level, nickname } = await getUserGameRolesByCookie()
    const { is_sign, first_bind } = await getSignRewardInfo(region, game_uid)
    // if (is_sign) {
    //     console.log(`Lv.${level}旅行者${nickname}，你今天已经签到过了喵～`)
    //     return
    // }
    if (first_bind) {
        console.log(`Lv.${level}旅行者${nickname}，请先手动签到一次`)
        return
    }
    
    // 发起签到请求
    await getSignReward({
        act_id: 'e202009291139501',
        region,
        game_uid
    })
    // 到这已经签到成功了
})()
