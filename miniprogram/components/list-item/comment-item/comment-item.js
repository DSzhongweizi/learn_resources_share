// components/comment/comment.js
import {
  app,
  db,
  moment
} from '../../../assets/utils/common'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pid: String, //帖子id
    comment: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    isLiked: false,
    isInput: false,
    isReply: false,
    showReplyText: false
  },
  /**
   * 组件的生命周期
   */
  lifetimes: {
    attached: function () {
      // this.setData({
      //   isReply: this.properties.rid ? true : false
      // })

      db.collection('users').field({
        'oneself.like_comments': true
      }).where({
        _openid: app.globalData.openId
      }).get({
        success: res => {
          this.setData({
            isLiked: res.data[0].oneself.like_comments.includes(this.properties.comment.cid)
          })
        },
        fail: err => console.log(err)
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    clickCommentLike: function () {
      console.log(this.properties.comment)
      const isLiked = !this.data.isLiked;
      const cid = this.properties.comment.cid;
      const openid = app.globalData.openId;
      const like = this.properties.comment.like
      this.setData({
        isLiked,
        'comment.like': isLiked ? like + 1 : like - 1
      })
      console.log(like)
      // 更新文章评论点赞数
      db.collection('posts').where({
        'comments.cid': cid
      }).update({
        data: {
          // ['detail.comments.'+[tmp]+'.$.like']: this.properties.like
          'comments.$.like': isLiked ? like + 1 : like - 1
        },
        success: res => console.log(res),
        fail: err => console.log(err)
      })
      // 更新文章回复点赞数
      // console.log(rid)
      // db.collection('posts').where({
      //   // _id: pid,
      //   // 'detail.comments.cid':cid,
      //   'detail.comments.replies.rid':rid
      // }).update({
      //   data: {
      //     // ['detail.comments.'+[tmp]+'.$.like']: this.properties.like
      //     'detail.comments.$.replies.like': this.properties.like
      //   },
      //   success: res => console.log(res),
      //   fail: err => console.log(err)
      // })


      // 更新用户点赞评论情况
      db.collection('users').where({
        _openid: openid,
      }).update({
        // data 传入需要局部更新的数据
        data: {
          'oneself.like_comments': isLiked ? db.command.push(cid) : db.command.pull(cid)
        },
        success: res => {console.log(res)},
        fail: err => {console.log(err)}
      })

      //更新点赞消息情况
      db.collection('users').where({
        _openid: openid,
      }).update({
        // data 传入需要局部更新的数据
        data: {
          messages: isLiked ? db.command.push({
            action: 'like_in_remark',
            userid: app.globalData.openId,
            pid: this.properties.pid,
            cid: this.properties.comment.cid,
            datetime: moment().format('YYYY/MM/DD kk:mm:ss'),
            isread:false
          }) : db.command.pull({
            action: 'like_in_remark',
            userid: app.globalData.openId,
            pid: this.properties.pid,
            cid: this.properties.comment.cid
          })
        },
        success: res => {
          console.log(res)
        },
        fail: err => {
          console.log(err)
        }
      })
    },
    // clickReply: function (e) {
    //   this.setData({
    //     isInput: true
    //   })
    // },
    // confirmReply: function (e) {
    //   const replyContent = e.detail.textFieldContent
    //   if (replyContent.length) {
    //     const replies = this.properties.replies;
    //     const datetime = moment().format('YYYY/MM/DD kk:mm:ss');
    //     const reply = {
    //       rid: app.globalData.openId + Date.parse(datetime), //回复id
    //       nickname: app.globalData.userInfo.nickName,
    //       avatar: app.globalData.userInfo.avatarUrl,
    //       datetime: datetime,
    //       content: replyContent,
    //       like: 0
    //     }
    //     replies.push(reply)
    //     this.setData({replies})
    //     db.collection('posts').where({
    //       _id: this.properties.pid,
    //       'details.comments.cid': this.properties.cid
    //     }).update({
    //       data: {
    //         'details.comments.$.replies': db.command.push(reply)
    //       },
    //       success: (res) => console.log(res),
    //       fail: err => console.log(err)
    //     })
    //   } else {
    //     wx.showToast({
    //       title: '回复内容不能为空!',
    //       icon: 'none'
    //     })
    //   }
    // }
  }
})