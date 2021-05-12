// components/list-item/study-item/study-item.js
import {
  app,
  db,
  moment
} from '../../../assets/utils/common';
import Notify from '../../../miniprogram_npm/@vant/weapp/notify/notify';
const _ = db.command
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    study:{
      type: Object,
      value: {}
    }
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    move_pos:[],
    x_dis:0,
    is_collect:false,
    is_download:false,
    show_progress: false,
    show_loading: false,
    download_progress: 0,
    download_state:'',
    integration:0
  },
  lifetimes:{
    attached () {
      // 获取子组件实例
      this.circle_progress = this.selectComponent('#circle-progress')
      db.collection('users').where({
        _openid: app.globalData.openId
      }).get({
        success: res => {
          // console.log(res)
          const {oneself:{collects=[],integration=0},records:{download_file_records=[]}} = res.data[0]
          this.data.is_download =  download_file_records.some(cur => cur.fileid == this.data.study.resid)
        this.data.integration = integration
          this.setData({
            is_collect: collects.includes(this.properties.study._id),
          })
        }
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    move: function (e) {
      this.data.move_pos.push(e.touches[0].clientX)
      const t = e.touches[0].clientX - this.data.move_pos[0] 
      this.setData({
        x_dis: t > -50 ? 0 : -100
      })
    },
    navigateTostudyDetail: function () {
      wx.navigateTo({
        url: '/pages/index/study/detail/detail?study='+JSON.stringify(this.properties.study),
      }).catch(err => console.log(err))
    },
    collect: function () {
      this.setData({is_collect: !this.data.is_collect})
      db.collection('users').where({
        _openid: app.globalData.openId
      }).update({
        data: {
          'oneself.collects': this.data.is_collect ? _.push(_this.properties.study._id) : _.pull(this.properties.study._id)
        },
        success: res => console.log(res),
        fail: err => console.log(err)
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
      const study = this.properties.study
      this.setData({show_loading:true})
      const downloadTask = wx.cloud.downloadFile({
        fileID: study.resid, // 文件 ID
        success: res => {
          // console.log(res)
          this.setData({show_progress: false,download_state: 'success'})
          wx.showToast({
            title: '下载完成',
            icon:'none'
          })
          fs.saveFile({
            tempFilePath: res.tempFilePath,
            success: res => {
              // console.log(res.savedFilePath)
              wx.openDocument({
                filePath: res.savedFilePath,
                showMenu: true,
                fileType: study.type,
                success: function (res) {
                  // console.log('打开文档成功')
                  wx.showToast({
                    title: '打开文档成功',
                    icon:'none'
                  })
                }
              })
            }
          })
        },
        fail: err => {
          this.setData({download_state: 'cancel'})
        },
        complete: res => {
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
              'oneself.integration':_.inc(this.data.is_download ? 0 : -2)
            },
            success:res => {
              this.data.is_download = true
            }
          })
        }
      })
      downloadTask.onProgressUpdate((res) => {
        this.circle_progress.drawProgress({progress:res.progress})
        this.setData({
          show_loading: res.progress < 10 ? true : false, 
          show_progress: res.progress < 10 ? false : true,
          download_progress: res.progress
        })
        // console.log('下载进度', res.progress)
      })
    }
  }
})