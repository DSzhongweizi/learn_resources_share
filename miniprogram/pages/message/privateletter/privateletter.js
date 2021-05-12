// miniprogram/pages/message/privateletter/privateletter.js
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
    chat_lists: [],
    other: {},
    oneself: {},
    id:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.id = {
      oneself: app.globalData.openId,
      other: options.userid
    }
    const getChatList =  (from,to,id) => {
      return new Promise(resolve => {
        db.collection('users').where({
          _openid: id[from]
        }).get().then(res => {
          let {messages: {noread = {}}} = res.data[0];
          let {messages: {read = {}}} = res.data[0];
          if(noread.privateletter[id[to]]){

          }
          let privateletter = {}
          let noread_p = noread.privateletter[id[to]]
          let read_p = read.privateletter[id[to]]
          if(noread_p) {
            privateletter = noread_p
            // console.log(privateletter.chat_lists)
            if(read_p){
              privateletter.chat_lists = [].concat(noread_p.chat_lists,read_p.chat_lists)
            }
          }else{
            privateletter = read_p ?? {}
          }
          
          console.log(privateletter)
          this.data[to] = {
            username: privateletter.username,
            avatar: privateletter.avatar,
            letter_lists: privateletter.chat_lists.map(cur => {
              cur.is_oneself = from == 'other' ? true : false
              return cur
            })
          }
          resolve(privateletter)
          // console.log(this.data[to])
        })
      })
    }
    
    (async () => {
      let tmp1 = await getChatList('other','oneself',this.data.id)
      let tmp2 = await getChatList('oneself','other',this.data.id)
      const oneself = this.data.oneself
      const other = this.data.other
      const chat_lists = [].concat(oneself.letter_lists,other.letter_lists)
      chat_lists.sort((a,b) => Date.parse(a.datetime)-Date.parse(b.datetime))
      this.setData({oneself,other,chat_lists})

      console.log(tmp2)
      db.collection('users').where({
      _openid:app.globalData.openId
      }).update({
        data:{
          messages:{
            [`noread.privateletter.${this.data.id.other}`]:_.remove(),
            [`read.privateletter.${this.data.id.other}`]:tmp2,
          }
        },
        success: res => console.log(res),
        fail: err => console.log(err)
      })
    })()

    
  },
  returnButton() {
    wx.navigateBack({
      delta: 1
    }).catch((err) => {})
  },
  confirmInput: function (e) {
    const chatContent = e.detail.textFieldContent;
    const chat_lists = this.data.chat_lists;
    if (chatContent.length) {
      console.log(chatContent)
      const chat = {
        datetime: moment().format('YYYY-MM-DD kk:mm:ss'),
        content: chatContent,
        is_oneself: true
      }
      chat_lists.push(chat)
      console.log(chat_lists)
      this.setData({
        chat_lists
      })
      //同步聊天到对应用户
      db.collection('users').where({
        _openid: this.data.id.other
      }).update({
        data: {
          'messages.noread.privateletter': {
            [`${app.globalData.openId}`]: {
              chat_lists: _.unshift(chat),
              username: app.globalData.userInfo.nickName,
              avatar: app.globalData.userInfo.avatarUrl
            }
          }
        },
        success: res => console.log(res),
        fail: err => console.log(err)
      })
    } else {
      wx.showToast({
        title: '评论内容不能为空!',
        icon: 'none'
      })
    }
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