import { BiLiBiLiAPI, checkuser, wbi_sign } from '#bilibili'
import { base, networks, Config } from '#modules'

export default class bilidata extends base {
  constructor(type) {
    super()
    this.type = type
    this.headers.Referer = 'https://api.bilibili.com/'
    this.headers.Cookie = Config.bilibilick
  }

  async GetData(data) {
    let result, COMMENTSDATA, EMOJIDATA, INFODATA, PARAM
    switch (this.type) {
      case 'bilibilivideo':
        INFODATA = await this.GlobalGetData({ url: BiLiBiLiAPI.INFO('bvid', data.id) })
        const BASEURL = BiLiBiLiAPI.VIDEO(INFODATA.data.aid, INFODATA.data.cid)
        const SIGN = await checkuser(BASEURL)
        const DATA = await this.GlobalGetData({
          url: BiLiBiLiAPI.VIDEO(INFODATA.data.aid, INFODATA.data.cid) + SIGN.QUERY,
          headers: this.headers,
        })

        PARAM = await wbi_sign(BiLiBiLiAPI.COMMENTS(1, INFODATA.data.aid))
        COMMENTSDATA = await this.GlobalGetData({ url: BiLiBiLiAPI.COMMENTS(1, INFODATA.data.aid) + PARAM, headers: this.headers })
        EMOJIDATA = await this.GlobalGetData({ url: BiLiBiLiAPI.EMOJI() })
        return { INFODATA, DATA, COMMENTSDATA, EMOJIDATA, USER: SIGN, TYPE: 'bilibilivideo' }

      case 'COMMENTS':
        const aPARAM = await wbi_sign(BiLiBiLiAPI.COMMENTS(1, INFODATA.data.aid))
        const aCOMMENTSDATA = await this.GlobalGetData({ url: BiLiBiLiAPI.COMMENTS(1, INFODATA.data.aid) + aPARAM, headers: this.headers })
        return aCOMMENTSDATA

      case 'EMOJI':
        return await this.GlobalGetData({ url: BiLiBiLiAPI.EMOJI() })

      case '申请二维码':
        return await this.GlobalGetData({ url: BiLiBiLiAPI.申请二维码() })

      case '判断二维码状态':
        result = await new networks({
          url: BiLiBiLiAPI.判断二维码状态(data),
          headers: this.headers,
        }).getHeadersAndData()
        return result

      case '检查是否需要刷新':
        result = await this.GlobalGetData({ url: BiLiBiLiAPI.检查是否需要刷新(data), headers: this.headers })
        return result

      case 'refresh_csrf':
        result = await this.GlobalGetData({
          url: BiLiBiLiAPI.refresh_csrf(data),
          headers: this.headers,
          type: 'text',
        })
        return result

      case '刷新Cookie':
        result = await this.GlobalGetData({
          url: BiLiBiLiAPI.刷新Cookie(),
          method: 'POST',
          body: data,
          headers: this.headers,
        })
        return result

      case '确认更新':
        result = await this.GlobalGetData({
          url: BiLiBiLiAPI.确认更新(),
          method: 'POST',
          body: data,
          headers: this.headers,
        })
        return result

      case 'bangumivideo':
        let isep
        if (data.id.startsWith('ss')) {
          data.id = data.id.replace('ss', '')
          isep = false
        } else if (data.id.startsWith('ep')) {
          data.id = data.id.replace('ep', '')
          isep = true
        }
        const QUERY = await checkuser(BiLiBiLiAPI.bangumivideo(data.id, isep))
        const INFO = await this.GlobalGetData({
          url: BiLiBiLiAPI.bangumivideo(data.id, isep),
          headers: this.headers,
        })
        result = { INFODATA: INFO, USER: QUERY, TYPE: 'bangumivideo' }
        return result

      case '获取用户空间动态':
        delete this.headers.Referer
        result = await this.GlobalGetData({
          url: BiLiBiLiAPI.获取用户空间动态(data),
          headers: this.headers,
        })
        return result

      case 'bilibilidynamic':
        delete this.headers.Referer
        const dynamicINFO = await this.GlobalGetData({
          url: BiLiBiLiAPI.动态详情(data.dynamic_id),
          headers: this.headers,
        })
        const dynamicINFO_CARD = await this.GlobalGetData({ url: BiLiBiLiAPI.动态卡片信息(dynamicINFO.data.item.id_str) })
        PARAM = await wbi_sign(BiLiBiLiAPI.COMMENTS(1, dynamicINFO_CARD.data.card.desc.rid))
        this.headers.Referer = 'https://api.bilibili.com/'
        COMMENTSDATA = await this.GlobalGetData({
          url: BiLiBiLiAPI.COMMENTS(mapping_table(dynamicINFO.data.item.type), oid(dynamicINFO, dynamicINFO_CARD)) + PARAM,
          headers: this.headers,
        })
        EMOJIDATA = await this.GlobalGetData({ url: BiLiBiLiAPI.EMOJI() })
        const USERDATA = await this.GlobalGetData({ url: BiLiBiLiAPI.用户名片信息(dynamicINFO.data.item.modules.module_author.mid) })
        return { dynamicINFO, dynamicINFO_CARD, COMMENTSDATA, EMOJIDATA, USERDATA, TYPE: 'bilibilidynamic' }

      case '用户名片信息':
        result = await this.GlobalGetData({
          url: BiLiBiLiAPI.用户名片信息(data),
          headers: this.headers,
        })
        return result

      case '动态详情':
        delete this.headers.Referer
        result = await this.GlobalGetData({
          url: BiLiBiLiAPI.动态详情(data.dynamic_id),
          headers: this.headers,
        })
        return result

      case '动态卡片信息':
        delete this.headers.Referer
        result = await this.GlobalGetData({ url: BiLiBiLiAPI.动态卡片信息(data.dynamic_id) })
        return result
    }
  }

  async GlobalGetData(options) {
    let result = await new networks(options).getData()
    if (result && result.code !== 0) {
      const errorMessage = errorMap[result.code] || '未知错误'
      logger.error(`获取响应数据失败！\n请求接口类型：${this.type}\n请求URL：${options.url}\n错误代码：${result.code}，\n含义：${errorMessage}`)
      return null
    } else {
      return result
    }
  }
}
function mapping_table(type) {
  const Array = {
    1: ['DYNAMIC_TYPE_AV', 'DYNAMIC_TYPE_PGC', 'DYNAMIC_TYPE_UGC_SEASON'],
    11: ['DYNAMIC_TYPE_DRAW'],
    12: ['DYNAMIC_TYPE_ARTICLE'],
    17: ['DYNAMIC_TYPE_LIVE_RCMD', 'DYNAMIC_TYPE_FORWARD', 'DYNAMIC_TYPE_WORD', 'DYNAMIC_TYPE_COMMON_SQUARE'],
    19: ['DYNAMIC_TYPE_MEDIALIST'],
  }
  for (const key in Array) {
    if (Array[key].includes(type)) {
      return key
    }
  }
  return 1
}

function oid(dynamicINFO, dynamicINFO_CARD) {
  if (dynamicINFO.data.item.type == 'DYNAMIC_TYPE_WORD') {
    return dynamicINFO.data.item.id_str
  } else return dynamicINFO_CARD.data.card.desc.rid
}

const errorMap = {
  '-1': '应用程序不存在或已被封禁',
  '-2': 'Access Key 错误',
  '-3': 'API 校验密匙错误',
  '-4': '调用方对该 Method 没有权限',
  '-101': '账号未登录',
  '-102': '账号被封停',
  '-103': '积分不足',
  '-104': '硬币不足',
  '-105': '验证码错误',
  '-106': '账号非正式会员或在适应期',
  '-107': '应用不存在或者被封禁',
  '-108': '未绑定手机',
  '-110': '未绑定手机',
  '-111': 'csrf 校验失败',
  '-112': '系统升级中',
  '-113': '账号尚未实名认证',
  '-114': '请先绑定手机',
  '-115': '请先完成实名认证',
  '-304': '木有改动',
  '-307': '撞车跳转',
  '-352': '风控校验失败 (UA 或 wbi 参数不合法)',
  '-400': '请求错误',
  '-401': '未认证 (或非法请求)',
  '-403': '访问权限不足',
  '-404': '啥都木有',
  '-405': '不支持该方法',
  '-409': '冲突',
  '-412': '请求被拦截 (客户端 ip 被服务端风控)',
  '-500': '服务器错误',
  '-503': '过载保护,服务暂不可用',
  '-504': '服务调用超时',
  '-509': '超出限制',
  '-616': '上传文件不存在',
  '-617': '上传文件太大',
  '-625': '登录失败次数太多',
  '-626': '用户不存在',
  '-628': '密码太弱',
  '-629': '用户名或密码错误',
  '-632': '操作对象数量限制',
  '-643': '被锁定',
  '-650': '用户等级太低',
  '-652': '重复的用户',
  '-658': 'Token 过期',
  '-662': '密码时间戳过期',
  '-688': '地理区域限制',
  '-689': '版权限制',
  '-701': '扣节操失败',
  '-799': '请求过于频繁，请稍后再试',
  '-8888': '对不起，服务器开小差了~ (ಥ﹏ಥ)',
}
