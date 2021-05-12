// components/circle-progress/circle-progress.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    progress:{
      type:Number,
      value:0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    drawProgress(e) {
      const query = wx.createSelectorQuery().in(this)
      query.select('#circle-progress')
        .fields({
          node: true,
          size: true
        })
        .exec((res) => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = wx.getSystemInfoSync().pixelRatio
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          ctx.scale(dpr, dpr)
          // Draw arc
          ctx.beginPath()
          ctx.arc(53, 53, 50, 300, 1.5 * Math.PI * e.progress/100)
          ctx.strokeStyle = "#56B37F"
          ctx.lineWidth = 6
          ctx.stroke()
        })
    }
  }
})