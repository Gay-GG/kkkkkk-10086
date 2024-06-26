import { base, GetID, common, Config } from '#modules'
import { DouYin, DouYinpush, iKun } from '#douyin'
import { BiLiBiLi, bilidata, Bilibilipush } from '#bilibili'

export class Tools extends plugin {
  constructor() {
    const rule = Config.videotool
      ? [
          {
            reg: '^.*((www|v|jx)\\.(douyin|iesdouyin)\\.com|douyin\\.com\\/(video|note)).*',
            fnc: 'douy',
          },
          {
            reg: '(bilibili.com|b23.tv|t.bilibili.com)',
            fnc: 'bilib',
          },
          {
            reg: '第(\\d{1,3})集',
            fnc: 'next',
          },
          {
            reg: '#?BGM',
            fnc: 'uploadrecord',
          },
        ]
      : []
    const task = [
      Config.douyinpush
        ? {
            cron: Config.douyinpushcron,
            name: '抖音更新推送',
            fnc: () => this.pushdouy(),
            log: Config.douyinpushlog,
          }
        : null,
      Config.bilibilipush
        ? {
            cron: Config.bilibilipushcron,
            name: '哔哩哔哩更新推送',
            fnc: () => this.pushbili(),
            log: Config.bilibilipushlog,
          }
        : null,
    ].filter((task) => task !== null)
    super({
      name: 'kkkkkk-10086-视频功能',
      dsc: '视频',
      event: 'message',
      priority: Config.defaulttool ? -Infinity : Config.priority,
      rule: [
        ...rule,
        { reg: '^#设置抖音推送', fnc: 'setpushdouy', permission: Config.douyinpushGroup },
        { reg: /^#设置[bB]站推送(?:UID:)?(\d+)$/, fnc: 'setpushbili', permission: Config.douyinpushGroup },
        { reg: '#抖音强制推送', fnc: 'pushdouy', permission: 'master' },
        { reg: '#B站强制推送', fnc: 'pushbili', permission: 'master' },
      ],
    })
    this.task = task
  }

  async pushdouy() {
    if (String(this.e?.msg).match('强制')) await new DouYinpush(this.e, true).action()
    else await new DouYinpush(this.e).action()
  }

  async pushbili() {
    if (String(this.e?.msg).match('强制')) await new Bilibilipush(this.e, true).action()
    else await new Bilibilipush(this.e).action()
  }

  async next(e) {
    if (user[this.e.user_id] === 'bilib') {
      const regex = String(e.msg).match(/第(\d+)集/)
      e.reply(`收到请求，第${regex[1]}集正在下载中`)
      BILIBILIOBJECT.Episode = regex[1]
      await new BiLiBiLi(e, BILIBILIOBJECT).RESOURCES(BILIBILIOBJECT, true)
    }
  }

  async bilib(e) {
    const urlRex = /(?:https?:\/\/)?www\.bilibili\.com\/[A-Za-z\d._?%&+\-=\/#]*/g
    const bShortRex = /(http:|https:)\/\/b23.tv\/[A-Za-z\d._?%&+\-=\/#]*/g
    let url = e.msg === undefined ? e.message.shift().data.replaceAll('\\', '') : e.msg.trim().replaceAll('\\', '')
    if (url.includes('b23.tv')) {
      url = bShortRex.exec(url)?.[0]
    } else if (url.includes('www.bilibili.com')) {
      url = urlRex.exec(url)[0]
    }
    const bvid = await GetID(url)
    const data = await new bilidata(bvid.type).GetData(bvid)
    await new BiLiBiLi(e, data).RESOURCES(data)
    user[this.e.user_id] = 'bilib'
    setTimeout(() => {
      delete user[this.e.user_id]
    }, 1000 * 60)
  }

  async uploadrecord(e) {
    const music_id = String(e.msg).match(/BGM(\d+)/)
    await new DouYin(e).uploadrecord(music_id[1])
  }

  async douy(e) {
    const url = String(e.msg).match(/(http|https):\/\/.*\.(douyin|iesdouyin)\.com\/[^ ]+/g)
    const iddata = await GetID(url)
    const data = await new iKun(iddata.type).GetData(iddata)
    const res = await new DouYin(e, iddata).RESOURCES(data)
    if (Config.sendforwardmsg && res) await e.reply(await new base(e).resultMsg(await common.makeForwardMsg(e, res.res, res.dec)))
    if (iddata.is_mp4) await new base(e).DownLoadVideo(res.g_video_url, Config.rmmp4 ? 'tmp_' + Date.now() : res.g_title)
    user[this.e.user_id] = 'douy'
    setTimeout(() => {
      delete user[this.e.user_id]
    }, 1000 * 120)
  }

  async setpushbili(e) {
    if (e.isPrivate) return true
    const data = await new bilidata('用户名片信息').GetData(/^#设置[bB]站推送(?:UID:)?(\d+)$/.exec(e.msg)[1])
    return await e.reply(await new Bilibilipush(e).setting(data))
  }

  async setpushdouy(e) {
    if (e.isPrivate) return true
    const data = await new iKun('Search').GetData({ query: e.msg.match(/^#设置抖音推送(\w+)$/)[1] })
    return await e.reply(await new DouYinpush(e).setting(data))
  }
}

let user = {}
