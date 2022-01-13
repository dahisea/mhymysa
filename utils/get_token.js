import superagent from 'superagent'

/**
 * 拿到我需要的Stuid和Stoken
 * @see https://github.com/Womsxd/AutoMihoyoBBS/blob/a4de4cb5c0f5f580416a33cfb39edd2d632ccfc4/login.py#L8
 * @type {string} cookie
 */
export async function getStuidAndStoken(cookie) {
    const cookieMap = new Map(cookie.split(';').map(item => item.trim()).map(item => item.split('=')))
    const ticket = cookieMap.get('login_ticket')
    const response = await superagent.get(`https://webapi.account.mihoyo.com/Api/cookie_accountinfo_by_loginticket?login_ticket=${ticket}`).send()
    const { body } = response
    console.log(body);
    if (body?.data?.msg === '成功') {
        const stuid = body.data.cookie_info.account_id
        const response2 = await superagent.get(`https://api-takumi.mihoyo.com/auth/api/getMultiTokenByLoginTicket?login_ticket=${ticket}&token_types=3&uid=${stuid}`).send()
        const { body: body2 } = response2
        const stoken = body2.data.list[0].token
        console.log(JSON.stringify(body2, null, '  '))
        return {
            Stuid: stuid,
            Stoken: stoken
        }
    }
}