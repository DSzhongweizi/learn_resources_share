//index.js
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    is_rowlayout:true,
    sign:'',
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    middle_functions: [{
        num: 0,
        zh: '关注',
        en: 'attention'
      },
      {
        num: 0,
        zh: '粉丝',
        en: 'fans'
      },
      {
        num: 0,
        zh: '收藏',
        en: 'collect'
      },
      {
        num: 0,
        zh: '喜欢',
        en: 'like'
      }
    ],
    bottom_functions: [{
        icon: '../../assets/images/set.png',
        text: '设置'
      },
      {
        icon: '../../assets/images/upload.png',
        text: '上传下载'
      },
      {
        icon: '../../assets/images/student.png',
        text: '学生认证'
      },
      {
        icon: '../../assets/images/clean-cache.png',
        text: '清理缓存'
      },
      {
        icon: '../../assets/images/feedback.png',
        text: '意见反馈'
      },
      {
        icon: '../../assets/images/use-help.png',
        text: '使用帮助'
      }
    ],
  },
  adjustLayout () {
    this.setData({
      is_rowlayout:!this.data.is_rowlayout
    })
  },
  onLoad: function () {
    this.loadData()
    const _this = this
    wx.getStorage({
      key: 'user_info',
      success (res) {
        app.globalData.userInfo = res.data
        _this.setData({
          userInfo:res.data,
          hasUserInfo: true
        })
      },
      fail (err) {
        console.log(err)
        _this.getUserInfo()
      }
    })
  },
  getUserInfo(e) {
    
    if (wx.getUserProfile) {
      console.log('sss')
      this.setData({canIUseGetUserProfile: true})
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
      // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '用于展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          try {
            wx.setStorageSync('user_info', res.userInfo)
          } catch (e) { console.log(e) }
          app.globalData.userInfo = res.userInfo
          console.log(res.userInfo)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          this.addUser()
        }
      })
    } else {
      // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
  },
  inputSign (e) {
    db.collection('users').where({
      _openid:app.globalData.openId
    }).update({
      data:{
        'oneself.sign': e.detail.value
      },
      success:res => console.log(res)
    })
  },
  addUser: function () {
    db.collection('users').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        userInfo: app.globalData.userInfo,
        oneself:{
          integration:5,
          pv:0,
          attentions:[app.globalData.openId]
        }
      }
    }).then(res => console.log(res)).catch(err => console.log(err))
    this.loadData()
  },
  loadData () {
    db.collection('users').field({
      oneself:true
    }).where({
      _openid:app.globalData.openId
    }).get({
      success:res => {
        const {oneself} = res.data[0]
        const {attentions=[],fans=[],collects=[],likes=[],sign=''} = oneself
        this.setData({
          sign,
          middle_functions:this.data.middle_functions.map(cur => {
            switch(cur.en){
              case 'attention':
                cur.num = attentions.length
                break;
              case 'fans':
                cur.num = fans.length
                break;
              case 'collect':
                 cur.num = collects.length
                 break;
              case 'like':
                cur.num = likes.length
                break;
            }
            return cur
          })
        })
      }
    })
  },
  clickFunciton: function (e) {
    const func_zh = e.currentTarget.dataset.func_zh
    wx.navigateTo({
      url: this.FunctionHelp(func_zh) + '?func=' + e.currentTarget.dataset.func_en,
    }).catch(e => {
      wx.showToast({
        icon: 'none',
        title: `${func_zh}功能尚未开放`,
      })
    });
  },
  FunctionHelp: function (func) {
    console.log(func)
    switch (func) {
      case "关注":
      case "粉丝":
      case "收藏":
      case "喜欢":
        return "./more/more"
      case "设置":
        return "./setup/setup"
      case "上传下载":
        return "./loadFile/loadFile"
      case "清理缓存":
        return "./cleanCache/cleanCache"
      case "意见反馈":
        return "./feedback/feedback"
      case "使用帮助":
        return "./useHelp/useHelp"
      case "学生认证":
        return "./studentAC/studentAC"
      default:
        return "";
    }
  },
  /**
   * 意见反馈
   */
  onFeedback: function () {
    wx.navigateTo({
      url: 'feedback/feedback',
    })
  },
  /**
   * 个人信息
   */
  onPersonalData: function () {
    wx.navigateTo({
      url: 'personalData/personalData',
    })
  },
  /**
   * 学生认证
   */
  onJwcBind: function () {
    wx.navigateTo({
      url: 'studentAC/studentAC',
    })
  },
  navigatoUserInfo() {
    wx.navigateTo({
      url: '/pages/common/userinfo/userinfo?userid=' + app.globalData.openId,
    })
  }
})