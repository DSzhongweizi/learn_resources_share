// program/pages/index/study/detail/detail.js
import {
  app,
  db,
  moment
} from '../../../../assets/utils/common';
import Notify from '../../../../miniprogram_npm/@vant/weapp/notify/notify';
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_collect: false,
    is_download: false,
    is_remark: true,    //可以评论否？
    is_abled: false,
    show_textarea: false,
    show_popup: false,
    show_progress: false,
    show_loading: false,
    download_progress: 0,
    study: '',
    remark: '',
    integration:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('onLoad')
    this.circle_progress = this.selectComponent('#circle-progress')
    this.setData({study:JSON.parse(options.study)})
    this.loadData()
    
  },
  loadData() {
    const study = this.data.study
    console.log(study)
    //初始化评论状态
    this.data.is_remark = !study.comments.some(cur => cur.commenterid == app.globalData.openId);
    db.collection('users').field({ 
      oneself:true,
      records:true
    }).where({
      _openid:app.globalData.openId
    }).get({
      success: res => {
        const {oneself:{collects=[],integration=0},records:{download_file_records=[]}} = res.data[0]
        this.data.is_download =  download_file_records.some(cur => cur.fileid == this.data.study.resid)
        this.data.integration = integration
        this.setData({
          is_collect: collects.includes(study._id),
        })
      },
      fail: err => console.log(err)
    })
  },
  remark: function () {
    if(this.data.is_download) {
      if (this.data.is_remark) {
        this.setData({
          show_textarea: !this.data.show_textarea
        })
      } else {
        Notify({
          type: 'warning',
          message: '不能重复评论',
          duration: '1000'
        });
      }
    }else{
      Notify({
        type: 'warning',
        message: '请先下载',
        duration: '1000'
      });
    }
  },
  inputRemark: function (e) {
    this.setData({
      remark: e.detail.value
    })
  },
  submitRemark: function (e) {
    if (this.data.remark) {
      this.setData({
        show_popup: true,
        is_abled: true
      })
    } else {
      Notify({
        type: 'warning',
        message: '请输入评论',
        duration: '1000'
      });
    }
  },
  closePopup: function () {
    this.setData({
      show_popup: false,
      is_abled: false
    })
  },
  submitRate: function (e) {
    const rate = e.detail.value.rate;
    const study = this.data.study
    if (!rate) {
      Notify({
        type: 'warning',
        message: '请评分',
        duration: '1000'
      });
      return
    }
    const comment = {
      commenter: app.globalData.userInfo.nickName,
      commenterid: app.globalData.openId,
      content: this.data.remark,
      rate,
      datetime: moment().format('YYYY/MM/DD kk:mm')
    }
    study.comments.push(comment)
    this.data.is_remark = false
    const new_rate = (study.rate + rate) / (study.comments.length-1 ? 2 : 1)
    this.setData({
      show_textarea: false,
      'study.comments': study.comments,
      'study.rate':new_rate
    })
    this.closePopup()
    db.collection('resources').doc(study._id).update({
      data: {
        rate: new_rate,
        comments: _.push(comment)
      },
      success: res => {}
    })
  },
  collect: function () {
    this.setData({
      is_collect: !this.data.is_collect
    })
    db.collection('users').where({
      _openid: app.globalData.openId
    }).update({
      data: {
        'oneself.collects': this.data.is_collect ? _.push(this.data.study._id) : _.pull(this.data.study._id)
      },
      success: res => {
        wx.showToast({
          icon: 'none',
          title: this.data.is_collect ? '收藏成功' : '取消收藏',
        })
      }
    })
  },
  download: function () {
    if( !this.data.is_download && this.data.integration < 2) {
      Notify({
        type: 'warning',
        message: '积分不足',
        duration: '1000'
      });
      return
    }
    const fs = wx.getFileSystemManager()
    const study = this.data.study
    const downloadTask = wx.cloud.downloadFile({
      fileID: study.resid, // 文件 ID
      success: res => {
        // 返回临时文件路径
        Notify({
          type: 'success',
          message: '下载成功',
          duration: '2000'
        });
        // this.data.is_download = true
        console.log(res.tempFilePath)
        this.setData({
          show_progress: false,
          download_state: 'success'
        })
        fs.saveFile({
          tempFilePath: res.tempFilePath,
          success: res => {
            wx.openDocument({
              filePath: res.savedFilePath,
              showMenu: true,
              fileType: study.type,
              success: function (res) {
                console.log('打开文档成功')
              }
            })
          }
        })
      },
      fail: err => {
        this.setData({
          download_state: 'cancel'
        })
      },
      complete: res => {
        console.log(this.data.is_download)
        db.collection('users').where({
          _openid: app.globalData.openId
        }).update({
          data: {
            'records.download_file_records': _.push({
              filename: study.name,
              fileid: study.resid,
              datetime: moment().format('YYYY/MM/DD kk:mm'),
              state: this.data.download_state
            }),
            'oneself.integration':db.command.inc(this.data.is_download ? 0 : -2)
          },
          success:res => {
            this.data.is_download = true
          }
        })
      }
    })
    downloadTask.onProgressUpdate((res) => {

      this.setData({
        show_loading: res.progress < 10 ? true : false,
        show_progress: res.progress < 10 ? false : true,
        download_progress: res.progress
      })
      // console.log('下载进度', res.progress)
      this.circle_progress.drawProgress({
        progress: res.progress
      })
    })

    // downloadTask.abort() // 取消下载任务
  },
  navigatoUserInfo() {
    wx.navigateTo({
      url: '/pages/common/userinfo/userinfo?userid=' + this.data.study.uploaderid,
    }).catch(err => {
      console.log(err)
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.circle_progress = this.selectComponent('#circle-progress')
    // console.log(this.circle_progress)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log("onShow")
    // this.loadData()
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