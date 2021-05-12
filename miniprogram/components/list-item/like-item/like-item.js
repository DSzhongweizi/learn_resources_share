// components/list-item/like-item/like-item.js
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
    likeid:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    like:{}
  },
  lifetimes:{
    attached () {
      // console.log(this.properties.likeid)
      const _this = this
      db.collection('posts').doc(this.properties.likeid).get({
        success:res => {
          // console.log(res.data)
          _this.setData({
            like: res.data
          })
        }
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    navigatoPostDetails () {
      wx.navigateTo({
        url: '../../../pages/community/details/details?post='+JSON.stringify(this.data.like),
      })
    }
  }
})
