
// function request(suffixUrl,data){
//   //解决请求的异步问题
//   return new Promise(function (resolve, reject){
//     wx.request({
//       url: app.config.host + suffixUrl,//login
//       data: data,
//       header: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       method: 'POST',
//       dataType: 'JSON',
//       success: function (res) { resolve(res.data) },
//       fail: function (res) { resolve(res.data) },
//       complete: function (res) { },
//     })
//   })
// }
const app = getApp()
const db = wx.cloud.database()
const moment = require('moment');

export {app, db, moment}

