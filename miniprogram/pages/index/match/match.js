// program/pages/index/match/match.js
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
    matchs: [],
    start_index: 0,
    show_return_top_btn: false,
    show_solo: false,
    con:{},
    empty_tip:{
      state:false,
      image:'',
      description:''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadDatas();
  },
  loadDatas: function () {
    db.collection('matchs').where(this.data.con).skip(this.data.start_index * 10).limit(10).get({
      success: res => {
        // console.log(res.data)
        this.setData({
          empty_tip: res.data.length ? {state:false} : {state:true,image:'search',description:'无相关赛事'},
          matchs: this.data.matchs.concat(res.data)
        })
      },
      fail: err => {
        console.log(err)
        this.setData({
          empty_tip: {state:true,image:'network',description:'请检查网络'}
        })
      }
    })
  },
  searchInput: function (e) {
    console.log(e.detail.input)
    if(e.detail.input){
      this.data.con.title = db.RegExp({
        regexp: e.detail.input,
        options: 'im'
      })
    }else{
      delete this.data.con['title']
    }
    this.data.matchs = []
    this.loadDatas()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      start_index: this.data.start_index + 1
    })
    this.loadDatas();
  },
  onPageScroll: function (e) {
    // console.log(e.scrollTop)
    this.setData({
      show_return_top_btn: e.scrollTop > 200 ? true : false
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})