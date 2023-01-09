import plugin from '../../../lib/plugins/plugin.js'
import { segment } from "oicq";
import uploadRecord from '../model/uploadRecord.js';
const yy = {
  "汪汪": "汪汪",
  "什么声音": "什么声音",
  "突然一声": "突然一声",
  "搞乱了": "搞乱了",
  "不要叫了": "不要叫了",
  "汪": "汪",
  "别狗叫了": "别狗叫了",
  "大胆": "大胆",
  "狗叫什么": "狗叫什么",
  "砸键盘": "砸键盘",
  "砸了": "砸键盘",
  "载入史册": "载入史册",
  "心烦意乱": "心烦意乱",
  "嘿": "嘿",
  "键盘收不": "键盘收不",
  "马上到": "马上到",
  "挂A": "挂A",
  "摆头": "摆头",
  "葫芦gei": "葫芦gei",
  // "": "",
  "哇靠": "哇靠",
  "本座来也": "本座来也",
  "护驾": "护驾",
  "啊！": "啊！",
  "放我一马": "放我一马",
  "我是主播": "我是主播",
  "威慑": "威慑",
  "走位": "走位",
  "螺旋": "螺旋",
  "别": "别",
  "不要": "不要",
  "击飞": "击飞",
  "芜芜": "芜芜",
  "瓜皮": "瓜皮",
  "你以为": "你以为",
  "来搞我": "来搞我",
  "螺旋": "螺旋",
  "别在搞我": "别在搞我",
  "搞什么": "搞什么",
  "小试牛刀": "小试牛刀",
  "雕虫小技": "雕虫小技",
  "遁入虚空": "遁入虚空",
  "螺旋走位": "螺旋走位",
  "宫保鸡丁": "宫保鸡丁",
  "航空母舰": "航空母舰",
  "凤舞九天": "凤舞九天",
  "近身硬打": "近身硬打",
  "祸国殃民": "祸国殃民",
  "螺旋摆头": "螺旋摆头",
  "摆头走位": "摆头走位",
  "为非作歹": "为非作歹",
  "东星耀扬": "东星耀扬",
  "不再低调": "不再低调",
  "螃蟹步伐": "螃蟹步伐",
  "亚洲捆绑": "亚洲捆绑",
  "蜻蜓点水": "蜻蜓点水",
  "老树盘根": "老树盘根",
  "功亏一篑": "功亏一篑",
  "花海": "花海",
  "空城": "空城",
  "简单爱": "简单爱",
  "告白气球": "告白气球",
}
const jireg = new RegExp(`^(${Object.keys(yy).join("|")})$`)
export class example extends plugin {
  constructor() {
    super({
      name: '耀阳盒',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: jireg,
          fnc: 'yaoyang'
        },
        {
          reg: "^耀阳盒$",
          fnc: 'help'
        }
      ]

    })
  }


  async yaoyang(e) {
    e.reply(await uploadRecord(`http://jilehe.125ks.cn/Voice/yyh/res/${encodeURIComponent(yy[e.msg])}.mp3`, 0, false))
  }
  async help(e) {
    e.reply(Object.keys(yy).join("，"))
  }
}

