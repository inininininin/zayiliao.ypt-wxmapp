// pages/out/taskCenter/taskCenter.js
var app=getApp()
var utils = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navtitle: '任务中心',
    statusBarHeight: getApp().globalData.statusBarHeight,
    titleBarHeight: getApp().globalData.titleBarHeight,
    dis: 'none',
    list1:[],
    list2:[],
  },
  look: function(e) {
    this.setData({
      dis: 'block',
    })
  },
  close: function(e) {
    this.setData({
      dis: 'none',
    })
  },
  gofinish:function(e){
    var url = e.currentTarget.dataset.url
    if (url == 1 || url == 5){
     wx.navigateTo({
       url: '../../login/login',
     })
    } else if (url == 3 || url == 4 || url == 7 || url == 8 || url == 10){
      wx.switchTab({
       url: '../hospital/hospital',
     })
    } else if (url == 6 || url == 9 || url == 12 || url == 11) {
     wx.switchTab({
       url: '../index/index',
     })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that=this
    wx.request({
      url: app.globalData.url + '/ypt/user/tasks',
      method: 'get',
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'cookie': wx.getStorageSync('cookie')
      },
      success: function (res) {
        
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.rows.length; i++) {

            // if (res.data.data.rows[i].gotExchangePointToday == res.data.data.rows[i].exchangePointUpperPerDay){
            //   res.data.data.rows[i].finish='1'
            // }else{
            //   res.data.data.rows[i].finish = '0'
            // }
            
            if (res.data.data.rows[i].type==0){
              var list1 = that.data.list1.concat(res.data.data.rows[i]) 
              res.data.data.rows[i].percent = (parseInt(res.data.data.rows[i].type0TodayGain) / parseInt(res.data.data.rows[i].type0TopLimitDaily))*100+"%"
              if( res.data.data.rows[i].percent=='100%'){
                res.data.data.rows[i].doneIs=1
              }else{
                res.data.data.rows[i].doneIs=0
              }
              that.setData({
                list1: list1
              })
            }else{
              if(res.data.data.rows[i].type1Gain!=''&&res.data.data.rows[i].type1Gain!=undefined&&res.data.data.rows[i].type1Gain!=null){
                res.data.data.rows[i].doneIs=1
                res.data.data.rows[i].percent='100%'
              }else{
                res.data.data.rows[i].doneIs=0
                res.data.data.rows[i].percent='0%'
              }
              // res.data.data.rows[i].percent = (parseInt(res.data.data.rows[i].type0TodayGain) / parseInt(res.data.data.rows[i].type0TopLimitDaily))*100+"%"
              var list2 = that.data.list2.concat(res.data.data.rows[i])
              that.setData({
                list2: list2
              })
            }
          }


          that.setData({
            list1: list1,
            list2: list2
          })
        } else if (res.data.code == 20) {
          wx.navigateTo({
            url: '../../login/login',
          })
        } else {
          wx.showToast({
            title: res.data.codeMsg
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    
  },
  backHistory: function(e) {
    wx.navigateBack({

    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh({
      complete: (res) => {},
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    wx.request({
      url: app.globalData.url + '/ypt/user/share',
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'cookie': wx.getStorageSync('cookie')
      },
      method: 'post',
      success: function (res) {
        if (res.data.code == 0) {
        
        }
      }
    })
  }
})