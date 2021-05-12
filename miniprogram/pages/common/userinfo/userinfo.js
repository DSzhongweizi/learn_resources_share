// program/pages/common/userInfo/userInfo.js
import {
  app,
  db,
  moment
} from '../../../assets/utils/common';
const _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oneself: {},
    records: {},
    userInfo: {},
    identity:{},
    userid: '',
    isAttention: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.userid = options.userid
    this.init()
  },
  /**
   * 初始化
   */
  init() {
    // console.log(this.data.userid)
    db.collection('users').where({
      _openid: this.data.userid
    }).get({
      success: res => {
        console.log(res.data[0])
        const { records, userInfo, oneself, identity={}} = res.data[0]
        this.setData({
          userInfo,
          identity,
          'oneself.pv': ++oneself.pv
        })
        const {fans = []} = oneself
        this.setData({
          oneself,
          isAttention: fans.includes(app.globalData.openId)
        })
        // 排序记录
        if (records) {
          const {upload_file_records = [], publish_post_records = []} = records
          this.setData({
            records: ([].concat(upload_file_records, publish_post_records)).sort((a, b) => Date.parse(b.datetime) - Date.parse(a.datetime))
          })
        }
      }
    })

    //更新访问量
    db.collection('users').where({
      _openid: this.data.userid
    }).update({
      data:{
        'oneself.pv':_.inc(1)
      }
    }).then(res => console.log(res)).catch(err => console.log(err))
  },
  /**
   * 关注事件
   */
  attention() {
    this.setData({
      isAttention: !this.data.isAttention
    })
    const isAttention = this.data.isAttention
    //更新用户自己关注情况
    db.collection('users').where({
      _openid: app.globalData.openId
    }).update({
      data: {
        'oneself.attentions': isAttention ? _.push(this.data.userid) : _.pull(this.data.userid),
      }
    })
    //更新被关注对象的粉丝
    console.log(app.globalData)
    db.collection('users').where({
      _openid: this.data.userid
    }).update({
      // data 传入需要局部更新的数据
      data: {
        'oneself.fans': isAttention ? _.push(app.globalData.openId) : _.pull(app.globalData.openId),
        'messages.noread.fans': isAttention ? _.unshift({
          userid: app.globalData.openId,
          username: app.globalData.userInfo.nickName,
          avatar: app.globalData.userInfo.avatarUrl,
          datetime: moment().format('YYYY/MM/DD kk:mm:ss')
        }) : _.pull({
          userid: app.globalData.openId,
        })
      },
      success: res => console.log(res),
      fail: err => console.log(err)
    })
  },
  privateLetter() {
    wx.navigateTo({
      url: '/pages/message/privateletter/privateletter?userid='+this.data.userid,
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