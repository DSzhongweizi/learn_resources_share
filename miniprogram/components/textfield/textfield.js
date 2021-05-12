// components/textfield/textfield.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isInput: {
      value: false,
      type: Boolean
    },
    blurevent:String,
    placeholderText: {
      value:'随便说点什么',
      type:String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    input_value: '',
    bottom: 0,
    is_focus:true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    inputBlur: function (e) {
      wx.showTabBar().catch(err => {})
      this.setData({
        input_value: e.detail.value,
        bottom: 0,
        isInput: this.properties.blurevent == 'privateletter' ? true : false
      })
    },
    inputFocus: function (e) {
      wx.hideTabBar().catch(err => {})
      this.setData({
        input_value: this.data.input_value,
        bottom: e.detail.height
      })
    },
    inputConfirm: function (e) {
      this.triggerEvent('confirmInput', {
        textFieldContent: e.detail.value,
      })
      this.setData({is_focus:true})
    }
  }
})