// components/post/post.js
import {
  app,
  db,
  moment
} from '../../../assets/utils/common';
const _ = db.command
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    post: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    isInput: false,
    isLiked: false,
    showActionsheet: false,
    comment: '',
    bottom: 0,
    imgHeight: 100,
    flex_percent: 33,
    groups: [{
        text: '举报',
        value: 1
      },
      {
        text: '查看主页',
        value: 2
      },
    ]
  },
  /**
   * 组件的生命周期
   */
  lifetimes: {
    created: function () {},
    attached: function () {},
    ready: function () {this.initData()}
  },
  pageLifetimes: {
    show: function () {
      const currentPageRoute = getCurrentPages().slice(-1).pop().route;
      this.setData({
        showComments: currentPageRoute == 'pages/community/community' ? false : true
      })
      this.initData()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    navigateToPostDetail: function (e) {
      const post = this.properties.post
      // 更新浏览次数
      db.collection('posts').doc(post._id).update({
        data: {
          'count.browse': ++post.count.browse
        },
        success: res => console.log(res),
        fail: err => console.log(err)
      })
      wx.navigateTo({
        url: './details/details?post=' + JSON.stringify(this.properties.post),
      }).catch(err => {})
    },
    moreAciton: function (e) {
      this.setData({ showActionsheet: false })
      switch (e.detail.value) {
        case 1:
          break;
        case 2:
          this.navigatoUserInfo();
          break;
      }
    },
    clickMask: function (e) {
      this.setData({ showActionsheet: false })
    },
    clickMore: function () {
      this.setData({ showActionsheet: true })
    },
    clickComment: function (e) {
      this.setData({ isInput: true })
    },
    clickLike: function () {
      const isLiked = !this.data.isLiked;
      const post = this.properties.post
      const like_count = post.count.like;
      const pid = post._id;
      this.setData({
        isLiked, 'post.count.like': isLiked ? like_count + 1 : like_count - 1
      })
      //同步文章的点赞数
      db.collection('posts').doc(pid).update({
        data: {'count.like': post.count.like},
        success: res => {}
      })
      //同步用户的点赞文章id集合
      db.collection('users').where({
        _openid: app.globalData.openId
      }).update({
        data: {'oneself.likes': isLiked ? _.push(pid) : _.pull(pid)},
        success: res => {}
      })
      //同步帖子作者的点赞消息
      // console.log(app.globalData)
      const datetime = moment().format('YYYY/MM/DD kk:mm:ss')
      db.collection('users').where({
        _openid: this.properties.post._openid
      }).update({
        // data 传入需要局部更新的数据
        data: {
          'oneself.like_count':isLiked ? _.inc(1) : _.inc(-1),
          'messages.noread.like': isLiked ? _.unshift({
            pid: this.properties.post._id,
            userid: app.globalData.openId,
            avatar: app.globalData.userInfo.avatarUrl,
            username: app.globalData.userInfo.nickName,
            datetime: datetime
          }) : _.pull({
            userid: app.globalData.openId,
            pid: this.properties.post._id
          })
        },
        success: res => {console.log(res)}
      })
    },
    confirmComment: function (e) {
      const commentContent = e.detail.textFieldContent
      if (commentContent.length) {
        const {comments=[]} = this.properties.post;
        const datetime = moment().format('YYYY/MM/DD kk:mm:ss');
        const comment = {
          cid: app.globalData.openId + Date.parse(datetime),
          openid: app.globalData.openId,
          nickname: app.globalData.userInfo.nickName,
          avatar: app.globalData.userInfo.avatarUrl,
          datetime: datetime,
          content: commentContent,
          like: 0,
        }
        comments.push(comment)
        this.setData({
          'post.comments': comments
        })
        this.triggerEvent("updateComments", {
          comments
        })
        //同步评论到对应帖子集合
        db.collection('posts').doc(this.properties.post._id).update({
          data: {comments},
          success: res => {
            wx.showToast({
              title: '评论成功',
              icon: 'none'
            })
          }
        })
        //同步帖子作者的评论消息
        db.collection('users').where({
          _openid: this.properties.post._openid
        }).update({
          // data 传入需要局部更新的数据
          data: {
            'messages.noread.remark': _.unshift({
              pid: this.properties.post._id,
              userid: app.globalData.openId,
              avatar: app.globalData.userInfo.avatarUrl,
              username: app.globalData.userInfo.nickName,
              content: commentContent,
              datetime: datetime
            })
          },
          success: res => {console.log(res)}
        })
      } else {
        wx.showToast({
          title: '评论内容不能为空!',
          icon: 'none'
        })
      }
    },
    previewImage(e) {
      const img_lists = this.properties.post.image_lists.map(img => img.url)
      wx.previewImage({
        current: img_lists[e.currentTarget.dataset.idx], // 当前显示图片的http链接
        urls: img_lists // 需要预览的图片http链接列表
      })
    },
  
    initData: function () {
      db.collection('users').field({
        'oneself.likes': true
      }).where({
        _openid: app.globalData.openId
      }).get({
        success: res => {
          const {likes=[]} = res.data[0].oneself
          this.setData({
            isLiked: likes.includes(this.properties.post._id)
          })
        },
        fail: err => console.log(err)
      })
      // console.log(this.properties.post.image_lists)
      const len = this.properties.post.image_lists.length;
      this.setData({
        flex_percent: len == 4 || len == 2 ? 50 : 33
      })
      this.createSelectorQuery().select('.photo').boundingClientRect(rect => {
        // console.log(rect.width)
        this.setData({
          imgHeight: rect ? rect.width : 100
        })
      }).exec()
    },
    navigatoUserInfo() {
      wx.navigateTo({
        url: '/pages/common/userinfo/userinfo?userid=' + this.properties.post._openid,
      })
    }
  }
})