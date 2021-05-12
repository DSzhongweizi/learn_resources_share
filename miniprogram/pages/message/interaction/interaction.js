// miniprogram/pages/message/interaction/interactions.js
import {
  app,
  db,
  moment
} from '../../../assets/utils/common';
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    interactions: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(JSON.parse(options.interactions))
    this.setData({
      interactions: JSON.parse(options.interactions)
    })
    // console.log(this.data.interactions)
    db.collection('users').where({
      _openid: app.globalData.openId,
    }).get({
      success: res => {
        // console.log(res.data[0].messages)
        const {noread:{remark=[],like=[]}} = res.data[0].messages;
        // console.log(remark,like)
        db.collection('users').where({
          _openid: app.globalData.openId
        }).update({
          data: {
            'messages.noread': {
              like:_.remove(),
              remark:_.remove()
            },
            'messages.read.like': _.push(like),
            'messages.read.remark': _.push(remark),
          },
          success: res => console.log(res),
          fail: err => console.log(err)
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})