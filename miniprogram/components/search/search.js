// components/search/search.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder:{
      type:String,
      value:'搜索'
    },
    showHistory:{
      type:Boolean,
      value:true
    },
    history_records:{
      type:Array,
      value:[]
    },
    refer_search: {
      type:String,
      value:'',
    },
    show_filter:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    inputFocus:false,
    search_input:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    inputFocus: function () {
      const _this = this
      wx.getStorage({
        key: _this.properties.refer_search,
        success(res) {
          _this.setData({
            history_records:res.data
          })
        }
      })
      _this.setData({
        inputFocus:true
      })
    },
    inputBlur: function () {
      this.setData({
        inputFocus:false
      })
    },
    inputing: function (e) {
      this.triggerEvent("searchInput",{input:e.detail.value})
    },
    inputConfirm: function (e) {
      const v = e.detail.value
      console.log(v)
      this.triggerEvent("searchInput",{input:v})
      if (v) {
        const records = this.properties.history_records
        if(records.includes(v)) {
          return
        }
        records.push(v)
        this.setData({history_records:records})
        wx.setStorage({
          key: this.properties.refer_search,
          data: records
        })
      }
    },
    clearHistories: function () {
      const _this = this
      wx.removeStorage({
        key: this.properties.refer_search,
        success (res) {
          _this.setData({
            history_records:[]
          })
        }
      })
    },
    showFilter: function (){
      this.triggerEvent("showFilter")
    },
    clickRecord: function (e){
      this.triggerEvent("searchInput",{input:e.currentTarget.dataset.record})
      this.setData({search_input:e.currentTarget.dataset.record})
    }
  }
})
