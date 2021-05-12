// components/list-item/collect-item/collect-item.js
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
    collectid:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    collect:{}
  },
  lifetimes:{
    attached () {
      const _this = this
      db.collection('resources').doc(this.properties.collectid).get({
        success:res => {
          _this.setData({
            collect: res.data
          })
        }
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    navigatoStudyDetails () {
      wx.navigateTo({
        url: '/pages/index/study/detail/detail?study='+JSON.stringify(this.data.collect),
      })
    }
  }
})
