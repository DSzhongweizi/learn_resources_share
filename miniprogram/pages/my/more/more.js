// program/pages/my/attention/attention.js
import {
  app,
  db,
  moment
} from '../../../assets/utils/common';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    field:{
      attention:{
        zh:'关注',
      },
      fans:{
        zh:'粉丝'
      }
    },
    active:'',
    attentions:[],
    fans:[],
    collects:[],
    likes:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({active: options.func})
    // console.log(this.data)
    this.loadDatas()
  },
  loadDatas: function () {
    const _this =this
    db.collection('users').field({oneself:true}).where({
      _openid:app.globalData.openId
    }).get({
      success (res) {
        const {oneself:{attentions=[],fans=[],collects=[],likes=[]}} = res.data[0]
        _this.setData({
          attentions,
          fans,
          collects,
          likes
        })
      },
      fail (err) {
        console.log(err)
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