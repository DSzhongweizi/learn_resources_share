//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      try {
        wx.cloud.init({
          // env 参数说明：
          //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
          //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
          //   如不填则使用默认环境（第一个创建的环境）
          env: 'ds00544',
          traceUser: true,
        })
      } catch (err) {
        console.log(err)
      }
    }
    this.globalData = {}
    try {
      var openId = wx.getStorageSync('openid')
      // console.log(openId,userInfo)
      if (openId) {
        // Do something with return value
        this.globalData.openId = openId
      } else {
        wx.cloud.callFunction({
          name: 'login'
        }).then(res => {
          console.log(res.result)
          try {
            wx.setStorageSync('openid', res.result.openid)
          } catch (e) {
            console.log(e)
          }
          this.globalData.openId = res.result.openid
        }).catch(err => {
          console.log(err)
        })
      }
    } catch (e) {
      // Do something when catch error
      console.log(e)
    } finally{
      // console.log(this)
    }
    try {
      var user_info = wx.getStorageSync('user_info')
      if (user_info) {
        // Do something with return value
        this.globalData.userInfo = user_info
      }else{
      //   wx.showModal({
      //     title: '暂未登录',
      //     content: '前往获取头像昵称',
      //     success (res) {
      //       if (res.confirm) {
      //         wx.switchTab({
      //           url: '/pages/my/my'
      //         })
      //       } else if (res.cancel) {}
      //     }
      //   })
      }
    } catch (e) {}
    wx.showTabBarRedDot({
      index: 2,
    })
  }
})