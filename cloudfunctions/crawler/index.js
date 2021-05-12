// 云函数入口文件
const cloud = require('wx-server-sdk')
const Crawler = require("crawler");
// const fs = require('fs')
const https = require('https');
// const path = require('path')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  // console.log('sss')
  const crawler = new Crawler();
  const baseUrl = "https://www.saikr.com"
  const dt_format = (v) => v.replace(/\./g, '-').replace(/\d{2}:/g, (t) => ' ' + t).replace('至', (t) => ' ' + t + ' ')
  let set = new Set();
  let count = 1
  // console.log('sss')
  // 爬取大类里的小类链接
  crawler.queue({
    url: baseUrl + "/vs",
    retries: 1,
    callback: (err, res, done) => {

      if (err) console.log(err);
      else {
        const $ = res.$;
        const big_category_list = {
          "工科": "engineering",
          "文体": "rs",
          "理科": "science",
          "商科": "business",
          "综合": "overall"
        }
        for (key in big_category_list) {
          const small_category_list = $(".sk-event-screen-subject-box").find("." + big_category_list[key]).find(".item-con a")
          let big_category = key // 该比赛所属大类
          small_category_list.each((i, elem) => {
            let small_category = $(elem).text() //该比赛所属小类
            //爬取小类里的比赛链接
            crawler.queue({
              url: baseUrl + $(elem).attr("href"),
              retries: 1,
              callback: (err, res, done) => {
                if (err) console.error(err);
                else {
                  const $ = res.$;
                  const match_list = $(".event4-1-list-box li .event4-1-detail-box")
                  match_list.each((i, elem) => {
                    let link = $(elem).find(".tit a").attr("href")
                    let title = $(elem).find(".tit a").attr("title") //该比赛题目
                    if (set.has(link)) return true;
                    else set.add(link)
                    // //爬取比赛的详情
                    crawler.queue({
                      url: link,
                      retries: 1,
                      callback: (err, res, done) => {
                        if (err) console.log(err);
                        else {
                          const $ = res.$;
                          const img_link = $(".sk-event4-1-detail-banner img").attr("src")
                          https.get(img_link, function (res) {
                            let chunks = [];
                            let size = 0;

                            res.on('data', function (chunk) {
                              chunks.push(chunk);
                              size += chunk.length; //累加缓冲数据的长度
                            });

                            res.on('end', function (err) {
                              let data = Buffer.concat(chunks, size);
                              // const fileStream = fs.createReadStream(path.join(__dirname, data))
                              // let img = img_link == "https://publicqn.saikr.com/2017/04/20/735_58f88227b2249.jpg" ? '' : data;
                              let img_url = '';
                              (async () => {
                                await cloud.uploadFile({
                                  cloudPath: 'match_images/' + Date.parse(new Date()) + (count++) + '.jpg',
                                  fileContent: img_link == "https://publicqn.saikr.com/2017/04/20/735_58f88227b2249.jpg" ? '' : data,
                                }).then(res => {
                                  // console.log(res.fileID)
                                  img_url = res.fileID
                                }).catch(err => {
                                  console.log(err)
                                  img_url = ''
                                }).finally(() => {
                                  console.log(img_url)
                                  const detail = $("#eventSideBar .sk-event-summary-box .sidebar-b-con").slice(2, 9)
                                  const obj = {
                                    big_category,
                                    small_category,
                                    title,
                                    link,
                                    img_url
                                  } //一个比赛对象
                                  detail.each((i, elem) => {
                                    const v = $(elem).find(".title-desc,.info-content").text().replace(/\s*/g, "");
                                    const re = new RegExp(v, 'g');
                                    const k = $(elem).find(".title").text().replace(/\s*/g, "").replace(re, "")
                                    // const state = k.slice(4)
                                    switch (k.slice(0, 4)) {
                                      case '类型':
                                        obj.type = v
                                        break;
                                      case '报名费':
                                        obj.entry_fee = v
                                        break;
                                      case '级别':
                                        obj.level = v
                                        break;
                                      case '参赛对象':
                                        obj.match_obj = v
                                        break;
                                      case '主办方':
                                        obj.sponsor = v
                                        break;
                                      case '报名时间':
                                        obj.apply_datetime = dt_format(v)
                                        break;
                                      case '比赛时间':
                                        obj.match_datetime = dt_format(v)
                                        break;
                                    }
                                  })
                                  // console.log(obj)
                                  db.collection('matchs').add({
                                    // data 字段表示需新增的 JSON 数据
                                    data: obj
                                  }).then(res => {
                                    console.log(res)
                                  }).catch(err => {
                                    console.log(err)
                                  })
                                })
                              })()
                              // let base64_img = data.toString('base64');
                              // let img = img_url == "https://publicqn.saikr.com/2017/04/20/735_58f88227b2249.jpg" ? '' : `data:image/png;base64,${base64_img}`

                            });
                          });
                        }
                        done()
                      }
                    })
                  })
                }
                done();
              }
            })
          })
        }
      }
      done();
    }
  })
}