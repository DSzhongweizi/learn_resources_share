// components/list-item/competition-item/competition-item.js
import {
  app,
  db,
  moment
} from '../../../assets/utils/common';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    match: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    apply_state: '无报名时间',
    match_state: '无比赛时间'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    longpress: function () {
      wx.setClipboardData({
        data: this.properties.match.link,
        success(res) {
          wx.getClipboardData({
            success(res) {
              wx.showToast({
                title: '比赛网址已复制',
                icon: 'none'
              })
            }
          })
        }
      })
    },
    judgeDatetime(is_before, is_between, datetime, text) {
      if (is_before) {
        return '距离' + -moment.duration(moment().diff(datetime[0])).days() + '天' + text
      } else if (is_between) {
        return '正在' + text
      } else {
        return text + '已经结束'
      }
    }
  },
  lifetimes: {
    attached: function () {
      const match = this.properties.match
      if (match.apply_datetime.includes('至')) {
        const apply_datetime = match.apply_datetime.split(' 至 ')
        const is_apply_before = moment().isBefore(apply_datetime[0])
        const is_apply_between = moment().isBetween(apply_datetime[0], apply_datetime[1], null, '[]')
        this.setData({
          apply_state: this.judgeDatetime(is_apply_before, is_apply_between, apply_datetime, '报名'),
        })
      }
      if (match.match_datetime.includes('至')) {
        const match_datetime = match.match_datetime.split(' 至 ')
        const is_match_before = moment().isBefore(match_datetime[0])
        const is_match_between = moment().isBetween(match_datetime[0], match_datetime[1], null, '[]')
        this.setData({
          match_state: this.judgeDatetime(is_match_before, is_match_between, match_datetime, '比赛')
        })
      }
    },
    ready: function () {}
  }
})