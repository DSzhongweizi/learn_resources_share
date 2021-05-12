//index.js
//获取应用实例
import {
  app,
  db,
  moment
} from '../../assets/utils/common';
// pages/test/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      'https://images.unsplash.com/photo-1551334787-21e6bd3ab135?w=640',
      'https://images.unsplash.com/photo-1551214012-84f95e060dee?w=640',
      'https://images.unsplash.com/photo-1551446591-142875a901a1?w=640'
    ],
    functions: [{
        icon: '../../assets/images/study.png',
        text: '学习'
      },
      {
        icon: '../../assets/images/match.png',
        text: '赛事'
      },
      {
        icon: '../../assets/images/graduate_student.png',
        text: '考研'
      },
      {
        icon: '../../assets/images/intern_student.png',
        text: '实习'
      }
    ],
    recommend_matchs: [],
    recommend_resources: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.load_recommend()
    // wx.cloud.callFunction({
    //   name:'crawler',
    // }).then(res => console.log(res)).catch(err => console.log(err))
  },
  drawProgress(e) {
    const query = wx.createSelectorQuery()
    query.select('#circle-progress')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)
        // Draw arc
        ctx.beginPath()
        ctx.arc(53, 53, 50, 300, 1.5 * Math.PI)
        ctx.strokeStyle = "#56B37F"
        ctx.lineWidth = 6
        ctx.stroke()
      })
  },
  load_recommend: function () {
    db.collection('users').where({
      _openid: app.globalData.openId
    }).field({
      oneself: true
    }).get({
      success: res => {
        const {oneself:{identity}} = res.data[0]
        if (identity) {
          db.collection('resources').where({
            description: db.command.neq(''),
            'tags.school': identity.school,
            'tags.grade': identity.grade,
            'tags.major': identity.major
          }).orderBy('rate', 'desc').limit(2).get({
            success: res => {
              console.log(res)
              this.setData({
                recommend_resources: res.data
              })
            }
          })
        }
      }
    })

    db.collection('matchs').where({
      level: '全国性',
      entry_fee: '免费',
      img: db.command.neq(''),
      match_datetime: db.command.neq('——')
    }).orderBy('apply_datetime.datetime', 'desc').limit(2).get({
      success: res => {
        console.log(res)
        this.setData({
          recommend_matchs: res.data
        })
      }
    })
  },
  clickFunciton: function (e) {
    const func = e.currentTarget.dataset.func
    wx.navigateTo({
      url: this.functionHelp(func),
    }).catch(e => {
      wx.showToast({
        icon: 'none',
        title: `${func}功能尚未开放`,
      })
    });
  },
  functionHelp: function (func) {
    switch (func) {
      case "学习":
        return "./study/study"
      case "赛事":
        return "./match/match"
      default:
        return "";
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // console.log("onReady")
    // const circle_progress = this.selectComponent('#circle-progress')
    // circle_progress.drawProgress({progress:60})
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log("onShow")
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
    // wx.startPullDownRefresh()
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