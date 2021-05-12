// pages/my/studentAC/studentAC.js
import {
  app,
  db,
  moment
} from '../../../assets/utils/common';
Page({
  data: {
    field:{
      school:{
        zh: '学校',
        en: 'school',
        v: '选择',
        pick: ['四川大学', '西南交通大学']
      },
      grade:{
        zh: '年级',
        en: 'grade',
        v: '选择',
        pick: ['大一', '大二','大三','大四']
      },
      major:{
        zh: '专业',
        en: 'major',
        v: '选择',
        pick: ['计算机', '数学']
      },
    },
    is_pick: false
  },
  onLoad: function () {
    db.collection('users').where({
      _openid:app.globalData.openId
    }).field({
      oneself:true
    }).get({
      success:res => {
        const {oneself:{identity}} = res.data[0]
        console.log(identity)
        if(identity){
          this.setData({
            'field.school.v':identity.school,
            'field.major.v': identity.major,
            'field.grade.v': identity.grade
          })
        }
      }
    })
  },
  pick: function (e) {
    switch(e.currentTarget.dataset.name){
      case 'school':
        this.setData({'field.school.v':this.data.field.school.pick[e.detail.value]})
        break;
      case 'major':
        this.setData({'field.major.v':this.data.field.major.pick[e.detail.value]})
        break;
      case 'grade':
        this.setData({'field.grade.v':this.data.field.grade.pick[e.detail.value]})
    }
    this.setData({is_pick:true})
  },
  cancelPick: function () {
    
  },
  
  studengtAC: function (e) {
    this.setData({is_pick:false})
    db.collection('users').where({
      _openid:app.globalData.openId
    }).update({
      data:{
        'oneself.identity':{
          school:this.data.field.school.v,
          major:this.data.field.major.v,
          grade:this.data.field.grade.v
        }
      },
      success:res => console.log(res)
    })
  }
})