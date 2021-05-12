// components/list-item/interaction/interaction-item.js
import {
  app,
  db,
  moment
} from '../../../assets/utils/common';
const _ = db.command
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    interaction: Object
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  lifetimes: {
    attached() {
      
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    navigatoUserInfo() {
      wx.navigateTo({
        url: '/pages/common/userinfo/userinfo?userid=' + this.properties.interaction.userid,
      })
    },
    navigatoPostDetail() {
      db.collection('posts').doc(this.properties.interaction.pid).get({
        success: res => {
          wx.navigateTo({
            url: '/pages/community/details/details?post=' + JSON.stringify(res.data),
          })
        }
      })

    }
  }
})