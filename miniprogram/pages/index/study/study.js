// pages/index/study/study.js
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
    history_records:[],
    studys:[],
    con:{},
    show_popup: false,
    show_solo: false,
    empty_tip:{
      state:false,
      image:'',
      description:''
    },
    terms: ['上册','下册'],
    filter_field:{
      preset:{
        event:'checkboxPresets',
        title:'预设',
        checked: true,
        arr:[]
      },
      categorys:{
        event:'checkboxCategorys',
        title:'类别',
        checked: false,
        arr:['试卷','课件','教材']
      },
      terms:{
        event:'checkboxTerms',
        title:'学期',
        checked: false,
        arr:['上册','下册']
      }
    },
    identity:{}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this
    wx.getStorage({
      key: 'set_preset',
      success (res) {
        console.log(res.data)
        _this.setData({
          'filter_field.preset.checked': res.data
        })
      },
      fail:err => console.log(err)
    })
    
    db.collection('users').where({
      _openid:app.globalData.openId
    }).field({
      oneself:true
    }).get({
      success:res => {
        console.log(res)
        const {oneself:{identity}} = res.data[0]
        if(identity){
          // console.log(Object.values(identity))
          this.setData({
            'filter_field.preset.arr': Object.values(identity)
          })
          this.data.identity = {
            school:identity.school,
            grade:identity.grade,
            major:identity.major
          }
          // this.data.con.tags = identity
          if(this.data.filter_field.preset.checked){
            this.data.con.tags = Object.assign({},this.data.identity)
          }else{
            this.data.con.tags = {}
          }
        }
        this.loadDatas();
      }
    })
  },
  loadDatas: function () {
    // console.log(this.data.con)
    db.collection('resources').where(this.data.con).orderBy('rate', 'desc').get({
      success: res => {
        console.log(res)
        this.setData({
          empty_tip: res.data.length ? {state:false} : {state:true,image:'search',description:'无相关资源'},
          show_solo:  res.data.length ?  true : false,
          studys : res.data
        })
      },
      fail: err => {
        console.log(err)
        this.setData({
          empty_tip: {state:true,image:'network',description:'请检查网络'}
        })
      }
    })
  },
  searchInput: function (e) {
    this.data.con.name = db.RegExp({
      regexp: e.detail.input,
      options: 'im'
    })
    this.loadDatas()
  },
  showFilter: function () {
    this.setData({show_popup: true})
  },
  closePopup: function() {
    this.setData({show_popup: false})
    console.log(this.data.con)
    this.loadDatas()
  },
  checkboxCategorys: function (e) {
    console.log(e.detail.value)
    const v = e.detail.value
    const tags = this.data.con.tags
    v.length ? tags['category'] = db.command.in(v) : delete tags['category']
  },
  checkboxTerms: function (e) {
    console.log(e.detail.value)
    const v = e.detail.value
    const tags = this.data.con.tags
    v.length ? tags['term'] = db.command.in(v) : delete tags['term']
  },
  checkboxPresets: function (e) {
    console.log(e.detail.value)
    const tags = this.data.con.tags
    const identity = this.data.identity
    const preset = e.detail.value;
    const arr = ['school','grade','major']
    arr.forEach(cur => {
      if(preset.includes(identity[cur])){
        tags[cur] = preset[preset.indexOf(identity[cur])]
      }else{
        delete tags[cur]
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