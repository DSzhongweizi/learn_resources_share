// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
//插入函数
const insert = async event => {
  try {
    return await db.collection(event.set).add({
      // data 字段表示需新增的 JSON 数据
      data: event.data
    })
  } catch (e) {
    console.error(e)
  }
}
//更新函数
const update = async event => {
  // const data = {}
  // switch(event.minop){
  //   case 'push':
  //     data[event.field] = _.push(event.data)
  //     break;
  // }
  console.log(event.data)
  try {
    return await db.collection(event.set).where(event.con).update({
      data: event.data
    })
  } catch(e) {
    console.error(e)
  }
}
//查询函数
const query = async event => {
  const res = await db.collection(event.set).where(event.con ? event.con : {}).skip(event.skip ? event.skip : 0).limit(event.limit ? event.limit : 100).get();
  if (res) {
    return res
  }
}
// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.op) {
    case 'insert':
      return await insert(event)
    case 'delete':
      break;
    case 'update':
      return await update(event)
    case 'query':
      return await query(event)
  }
}