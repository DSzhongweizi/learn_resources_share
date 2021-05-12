// pages/community/community.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    posts: Array,
    w: 0,
    x: 0,
    y: 0,
    con: {},
    history_records: [],
    empty_tip:{
      state:false,
      image:'',
      description:''
    },
    // search_input:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app)
    wx.getSystemInfo({
      success: res => {
        this.setData({
          w: res.screenWidth
        })
      }
    })
    const _this = this
    wx.getStorage({
      key: 'community_search',
      success(res) {
        _this.setData({
          history_records:res.data
        })
      }
    })
  },
  writePost: function () {
    console.log(app.globalData.openId)
    if (app.globalData.userInfo) {
      wx.navigateTo({
        url: './editPost/editPost',
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '还没登录，是否前去登录？',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../my/my',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  move: function (e) {
    const w = this.data.w;
    this.setData({
      x: -e.detail.x < w / 2 ? 0 : -w,
      y: e.detail.y
    })
  },
  loadDatas: function () {
    db.collection('posts').where(this.data.con).get({
      success: res => {
        // console.log(res.data)
        this.setData({
          empty_tip: res.data.length ? {state:false} : {state:true,image:'search',description:'无相关帖子'},
          posts: res.data.reverse()
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '获取数据失败'
        })
        this.setData({
          empty_tip: {state:true,image:'network',description:'请检查网络'}
        })
      }
    })
  },
  searchInput: function (e) {
    this.data.con.content = db.RegExp({
      regexp: e.detail.input,
      options: 'im'
    })
    this.loadDatas()
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
    this.loadDatas()
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
    // wx.stopPullDownRefresh()
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