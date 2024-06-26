import fs from 'fs'
import _ from 'lodash'
import { Render, Version } from '#modules'
import { helpCfg, helpList } from '../config/system/help_cfg.js'

export class Help extends plugin {
  constructor() {
    super({
      name: 'kkk帮助',
      event: 'message',
      priority: 2000,
      rule: [
        {
          reg: '^#?kkk帮助$',
          fnc: 'help',
        },
        {
          reg: '^#?kkk版本$',
          fnc: 'version',
        },
      ],
    })
  }

  async version(e) {
    return await Render.render(
      'html/help/version-info',
      {
        currentVersion: Version.version,
        changelogs: Version.changelogs,
        elem: 'cryo',
      },
      { e, scale: 1.8 },
    )
  }

  async help(e) {
    let helpConfig = _.defaults(helpCfg)
    let helpGroup = []
    _.forEach(helpList, (group) => {
      if (group.auth && group.auth === 'master' && !e.isMaster) {
        return true
      }
      _.forEach(group.list, (help) => {
        let icon = help.icon * 1
        if (!icon) {
          help.css = 'display:none'
        } else {
          let x = (icon - 1) % 10
          let y = (icon - x - 1) / 10
          help.css = `background-position:-${x * 50}px -${y * 50}px`
        }
      })

      helpGroup.push(group)
    })

    return await Render.render(
      'html/help/index',
      {
        helpCfg: helpConfig,
        helpGroup,
        bg: await rodom(),
        colCount: 3,
        element: 'default',
      },
      { e, scale: 1.8 },
    )
  }
}

const rodom = async function () {
  let image = fs.readdirSync(process.cwd() + '/plugins/kkkkkk-10086/resources/html/help/img/')
  let list_img = []
  for (let val of image) {
    list_img.push(val)
  }
  let imgs = list_img.length == 1 ? list_img[0] : list_img[_.random(0, list_img.length - 1)]
  return imgs
}
