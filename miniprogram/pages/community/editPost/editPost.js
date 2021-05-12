// pages/community/editTrends/editTrends.js
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
    post: {
      content: '',
      image_lists: []
    },
    preview_size:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this
    wx.getSystemInfoAsync({
      success (res) {
        // console.log(res.screenWidth,res.windowWidth)
        _this.setData({
          preview_size:(res.screenWidth - 8) / 4
        })
      }
    })
  },
  // 上传图片
  uploadImageToCloud(e) {
    const image_lists = e.detail.file;
    const uploadFilePromise = (url,idx) => {
      return wx.cloud.uploadFile({
        cloudPath: 'images/'+ Date.parse(new Date()) + idx + url.replace(/(\w+):\/\/(\w+)(\/?)\w+/g,''),
        filePath: url
      });
    };
    // console.log(image_lists)
    const uploadTasks = image_lists.map((image,idx) => uploadFilePromise(image.url,idx));
    Promise.all(uploadTasks)
      .then(data => {
        wx.showToast({
          title: '上传成功',
          icon: 'none'
        });
        const newFileList = data.map(item => {
          return {
            url: item.fileID
          }
        });
        this.data.post.image_lists.concat(newFileList)
        this.setData({
          'post.image_lists': this.data.post.image_lists.concat(newFileList)
        });
      })
      .catch(e => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
        console.log(e);
      });
  },
  /**
   * 删除图片
   */
  deleteImage: function (e) {
    this.data.post.image_lists.splice(e.detail.index, 1)
    this.setData({
      'post.image_lists': this.data.post.image_lists
    })

    wx.cloud.deleteFile({
      fileList: [e.detail.file.url]
    }).then(res => {
      // handle success
      wx.showToast({
        title: '删除成功',
        icon:'none'
      })
    }).catch(error => {
      // handle error
    })
  },
  /**
   * 发帖
   * @param {*} e 
   */
  postMessage: function (e) {
    // console.log(this.data.post.image_lists)
    const content = e.detail.value.post;
    const datetime = moment().format('YYYY/MM/DD kk:mm')
    if (content.length) {
      db.collection('posts').add({
        data: {
          nickname: app.globalData.userInfo.nickName, //作者名字
          avatar: app.globalData.userInfo.avatarUrl, //作者头像
          content: content, //帖子内容
          image_lists: this.data.post.image_lists,
          datetime: datetime,
          count: {
            browse: 0,
            like: 0,
            forward: 0,
          },
          comments: []
        },
        success: res => {
          console.log(res)
          db.collection('users').where({
            _openid: app.globalData.openId
          }).update({
            data: {
              'records.publish_post_records': db.command.push({
                postid: res._id,
                datetime: datetime,
                content: content
              })
            },
            success: function (res) {
              wx.showToast({
                title: '发帖成功',
              })
              wx.navigateBack({
                delta: 1,
              })
            }
          })
          // console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '发帖失败'
          })
          console.error('[数据库] [新增记录] 失败：', err)
        }
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '内容不能为空'
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