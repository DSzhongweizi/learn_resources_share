import {app, db, moment} from '../../../assets/utils/common';
const _ = db.command
// components/list-item/attention/attention.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    userid: String,
    target: String,
  },

  /**
   * 组件的初始数据
   */
  data: {
    isAttention: true,
    userInfo:{}
  },
  lifetimes: {
    attached: function () {
      this.setData({
        isAttention: this.properties.target == 'attention'
      })
      // 在组件实例进入页面节点树时执行
      console.log(this.properties.userid)
      this.loadData(this.properties.userid)
    },
    ready: function () {
      
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //加载列表用户的数据
    loadData (userid) {
      db.collection('users').field({
        userInfo: true,
        oneself: true
      }).where({
        _openid:userid
      }).get({
        success:res => {
          // console.log(res.data[0])
          const {userInfo,oneself} = res.data[0]
          // console.log(this.properties.target,userInfo)
          this.setData({userInfo})
          console.log(oneself)
          if(this.properties.target == 'fans'){
            this.setData({
              isAttention: oneself.fans.includes(app.globalData.openId)
            })
            //更新消息状态
            db.collection('users').where({
              _openid: app.globalData.openId,
            }).get({
              success: res => {
                // console.log(res.data[0].messages)
                const {noread:{fans=[]}} = res.data[0].messages;
                // console.log(remark,like)
                db.collection('users').where({
                  _openid: app.globalData.openId
                }).update({
                  data: {
                    'messages.noread': {
                      fans:_.remove(),
                    },
                    'messages.read.fans': _.push(fans),
                  },
                  success: res => console.log(res),
                  fail: err => console.log(err)
                })
              }
            })
          }
        }
      })
    },
    attentionAction: function () {
      const target = this.properties.target
      this.setData({
        isAttention: !this.data.isAttention
      })
      // console.log(this.data.isAttention)
      const pull = _.pull(this.properties.userid)
      // console.log(this.data.isAttention)
      const _pull = ( target == 'attention') ? {'oneself.attentions':pull} : {'oneself.fans':pull}
      //更新自己的关注和粉丝列表
      db.collection('users').where({
        _openid:app.globalData.openId,
      }).update({
        data: this.data.isAttention ? {'oneself.attentions':_.push(this.properties.userid)} : _pull,
        success (res) {console.log(res)},
        fail (err) {console.log(err)}
      })
      //更新他人的粉丝列表
      if( target == 'fans'){
        db.collection('users').where({
          _openid: this.properties.userid,
        }).update({
          data: this.data.isAttention ? {'oneself.fans':_.push(app.globalData.openId)} : {'oneself.fans':_.pull(app.globalData.openId)},
          success () {
            console.log(res)
          },
          fail (err) {
            console.log(err)
          }
        })
      }
    },
    navigatoUserInfo () {
      wx.navigateTo({
        url: '/pages/common/userinfo/userinfo?userid=' + this.properties.userid,
      })
    }
  }
})