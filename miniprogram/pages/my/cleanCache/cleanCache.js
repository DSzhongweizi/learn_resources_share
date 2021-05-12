// program/pages/my/cleanCache/cleanCache.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checked: [],
    checkbox: {
      user_info: {
        zh: '登录状态'
      },
      search_record: {
        zh: '搜索记录',
        // match_search:{
        //   zh:'赛事搜索'
        // },
        // study_search:{
        //   zh:'资源搜索'
        // },
        // post_search:{
        //   zh:'帖子搜索'
        // }
      },
      set_preset: {
        zh: '预设'
      },
    }
  },
  checkChange: function (e) {
    console.log(e.detail.value)
    this.data.checked = e.detail.value
  },
  cleanConfirm: function () {
    let checked_en = [],checked_zh = []
    //预处理
    this.data.checked.forEach(cur => {
      cur.replace(/(\w+):(\p{Unified_Ideograph}+)/u,(t,a,b) => {
        console.log(a,b)
        if(a == "search_record"){
          checked_en.push(...['match_search', 'study_search', 'post_search'])
        }else{
          checked_en.push(a)
        }
        checked_zh.push(b)
      })
    })
    console.log(checked_en,checked_zh)
    wx.showModal({
      title: '清除缓存',
      content: `确定清除${checked_zh.join('和')}`,
      success (res) {
        if (res.confirm) {
          checked_en.forEach(cur => {
            wx.removeStorage({
              key: cur,
              success(res) {
                console.log(res)
              }
            })
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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