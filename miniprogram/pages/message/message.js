// program/pages/message/message.js
import {
  app,
  db,
  moment
} from '../../assets/utils/common';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    interactions: [],
    notifications: [],
    fanss: [],
    privateletters: [],
    fields: {
      interaction: {
        event: 'interaction',
        title: '互动消息',
        subtitle: '无',
        has_message: false,
      },
      notification: {
        event: 'notification',
        title: '系统通知',
        subtitle: '社区新规定',
        has_message: false,
      },
      fans: {
        event: 'fansAttention',
        title: '粉丝',
        subtitle: '无',
        has_message: false,
      },
      // privateletter:{
      //   event:'privateLetter',
      //   title:'南山',
      //   subtitle:'今天在干嘛？',
      //   has_message:false,
      // }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadData();
  },
  loadData() {
    db.collection('users').field({
      messages: true
    }).where({
      _openid: app.globalData.openId
    }).get({
      success: res => {
        const {
          read = {}, noread = {}
        } = res.data[0].messages
        // console.log(read, noread)
        let noread_count = 0;
        for(const item in noread){
          noread_count += Object.keys(noread[item]).length
        }
        if(noread_count){
          wx.setTabBarBadge({
            index: 2,
            text: noread_count+'',
          })
        }else{
          wx.hideTabBarRedDot({
            index:2
          }).then(res => console.log(res)).catch(err => console.log(err))
        }
        const read_interactions = [].concat(read.remark ?? [], read.like ?? [])
        const noread_interactions = [].concat(noread.remark ?? [], noread.like ?? [])
        // console.log(read_interactions, noread_interactions)
        const interactions = this.data.interactions = [].concat(read_interactions, noread_interactions);
        const fanss = this.data.fanss = [].concat(read.fans ?? [], noread.fans ?? []);

        // 更新消息界面
        this.setData({
          'fields.interaction.subtitle': interactions.length ? interactions[0].username + ' ' + (interactions[0].content ? '评论' : '点赞') + '你的帖子' : '无',
          'fields.fans.subtitle': fanss.length ? fanss[0].username + ' ' + '关注了你' : '无'
        })
        // 更新未读状态
        this.setData({
          'fields.interaction.has_message': noread_interactions.length ? true : false,
          'fields.fans.has_message': (noread.fans ?? []).length ? true : false
        })

        // 未读私信列表
        const privateletters = this.data.privateletters;
        const noread_privateletter = noread.privateletter ?? {}
        // console.log(noread_privateletter)
        for (const userid in noread_privateletter) {
          privateletters.push({
            userid,
            username: noread_privateletter[userid].username,
            avatar: noread_privateletter[userid].avatar,
            // datetime: read_privateletter[userid].chat_lists[0].datetime,
            content: noread_privateletter[userid].chat_lists[0].content,
            has_message: true
          })
        }
        // 已读私信列表
        const read_privateletter = read.privateletter ?? {}
        for (const userid in read_privateletter) {
          privateletters.push({
            userid,
            username: read_privateletter[userid].username,
            avatar: read_privateletter[userid].avatar,
            datetime: read_privateletter[userid].chat_lists[0].datetime,
            content: read_privateletter[userid].chat_lists[0].content
          })
        }
        console.log(privateletters)
        //更新私信界面
        this.setData({
          privateletters
        })
        try {
          wx.setStorageSync('msg_backup', this.data)
        } catch (e) {}
      }
    })
  },
  fansAttention() {
    wx.navigateTo({
      url: '../my/more/more?func=fans',
    }).then(res => {}).catch(err => console.log(err))
  },
  interaction() {
    wx.navigateTo({
      url: './interaction/interaction?interactions=' + JSON.stringify(this.data.interactions),
    })
  },
  privateLetter(e) {
    console.log(e.currentTarget.dataset.userid)
    wx.navigateTo({
      url: './privateletter/privateletter?userid=' + e.currentTarget.dataset.userid,
    })
  },
  searchInput: function (e) {
    const _this = this
    wx.getStorage({
      key: 'msg_backup',
      success(res) {
        console.log(res.data)
        const privateletters = res.data.privateletters
        const fields = res.data.fields
        // console.log(privateletters,fields)
        const re = new RegExp(e.detail.input)
        for (const item in fields) {
          console.log(fields[item].title)
          if (!re.test(fields[item].title)) {
            delete fields[item]
          }
        }
        // console.log(privateletters,fields)
        _this.setData({
          privateletters: privateletters.filter(cur => re.test(cur.username)),
          fields
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
    // wx.showTabBarRedDot({
    //   index: 2,
    // })
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