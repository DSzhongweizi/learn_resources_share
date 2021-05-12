// pages/my/uploadFile/uploadFile.js
const multiUpload = require('../../../assets/utils/multiUpload');
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
    tips: '点击上面选择你要分享的学习资料吧',
    file: Object,
    fileName: '',
    fileType: '',
    fileSize: 0,
    upload_progres: 0,
    show_file_info: false,
    show_progress: false,
    upload_state: false,
    field: {
      school: {
        zh: '学校',
        en: 'school',
        v: '必填',
        pick: ['四川大学', '西南交通大学']
      },
      major: {
        zh: '专业',
        en: 'major',
        v: '必填',
        pick: ['计算机', '数学']
      },
      grade: {
        zh: '年级',
        en: 'grade',
        v: '必填',
        pick: ['大一', '大二', '大三', '大四']
      },
      year: {
        zh: '年份',
        en: 'year',
        v: '必填',
        pick: ['2021', '2020', '2019', '2018']
      },
      term: {
        zh: '学期',
        en: 'term',
        v: '必填',
        pick: ['上册', '下册']
      },
      category: {
        zh: '类别',
        en: 'category',
        v: '必填',
        pick: ['试卷', '课件', '教材']
      }
    },
    // description:'备注',
    upload_file_records: [],
    download_file_records: [],
    active: 'upload',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadRecords()
  },
  /**
   * 选择文件
   */
  selectFile: function () {
    const _this = this;
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success(res) {
        const file = res.tempFiles[0];
        const fileName = file.name.replace(/\.\w+/g, t => {
          _this.setData({
            fileType: t.replace('.', '')
          })
          return '';
        });
        const fileSize = (file.size / 1024).toFixed(2)
        _this.setData({
          file: file,
          fileName,
          fileSize: fileSize > 1024 ? (fileSize / 1024).toFixed(2) + 'MB' : fileSize + 'KB',
          show_file_info: true
        })
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  cancelSelectFile: function () {
    this.setData({
      show_file_info: false
    })
  },
  uploadFile: function (e) {
    const _this = this

    const v = e.detail.value;
    const field = _this.data.field;
    const ishasV = (field) => {
      for (const item in field) {
        // console.log(field[item].v)
        if (field[item].v == '必填') return false
      }
      return true
    }
    if (v.school && v.major && v.grade && v.year && v.category && v.term || ishasV(field)) {
      _this.setData({
        show_progress: true
      })
      const file = _this.data.file;
      const uploadTask = wx.cloud.uploadFile({
        cloudPath: 'study/' + file.name, // 上传至云端的路径
        filePath: file.path, // 小程序临时文件路 
        success: res => {
          _this.setData({
            show_file_info: false,
            show_progress: false,
            upload_state: 'success'
          })
        },
        fail: err => {
          _this.setData({
            upload_state: 'cancel'
          })
        },
        complete: (res) => {
          // 判断上传成功与否
          if (res.fileID) {
            const upload_datetime = moment().format('YYYY/MM/DD kk:mm')
            db.collection('resources').add({
              // data 字段表示需新增的 JSON 数据
              data: {
                resid: res.fileID,
                uploader: app.globalData.userInfo.nickName,
                name: v.name,
                // subject: v.subject,
                type: v.type,
                size: v.size,
                tags: {
                  school: field.school.v,
                  major: field.major.v,
                  grade: field.grade.v,
                  year: field.year.v,
                  category: field.category.v,
                  term: field.term.v
                },
                description: v.description,
                rate: 0,
                datetime: upload_datetime,
                comments: []
              },
              success: (res) => {
                // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                wx.showToast({
                  title: '上传文件成功'
                })
                this.loadRecords()
              },
              fail: err => console.log(err)
            })
            db.collection('users').where({
              _openid: app.globalData.openId
            }).update({
              data: {
                'records.upload_file_records': db.command.push({
                  fileid: res.fileID,
                  filename: v.name,
                  category:field.category.v,
                  datetime: upload_datetime,
                  state: _this.data.upload_state
                }),
                'oneself.integration':db.command.inc(3)
              },
              success: res => {
                console.log(res)
              },
              fail: err => console.log(err)
            })
          }
        }
      })
      wx.cloud.downloadFile({
        fileID: '文件id'
      }).then(res => console.log(res.tempFilePath)).catch(err => console.log(err))

      uploadTask.onProgressUpdate((res) => {
        _this.setData({
          upload_progress: res.progress
        })
        // console.log('上传进度', res.progress)
      })
    } else {
      wx.showToast({
        title: '请检查必填字段',
        icon: 'none',
      })
    }
  },
  pick: function (e) {
    // console.log(e)
    const field = this.data.field
    const name = e.currentTarget.dataset.name
    const index = e.detail.value
    field[name].v = field[name].pick[index]
    this.setData({
      field
    })
  },
  loadRecords: function () {
    db.collection('users').where({
      _openid: app.globalData.openId
    }).field({
      records: true
    }).get({
      success: res => {
        console.log(res)
        this.setData({
          upload_file_records: res.data[0].records.upload_file_records,
          download_file_records: res.data[0].records.download_file_records
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