// pages/login/login.js
var app = getApp()
var WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    titleBarHeight: getApp().globalData.titleBarHeight,
    times: '获取验证码',
    time: 60,
    key: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showIs: false,
    code: '',
    type: '',
    href:'',
    selectAgree:true,
    version:app.globalData.version
  },
  selectIcon: function (e) {
    var selectAgree = !this.data.selectAgree;
    this.setData({
      selectAgree: selectAgree
    });
  },
  changeHos(e) {
    wx.navigateTo({
      url: '../hosList/hosList',
    })
  },
  loginXy(e){
    wx.navigateTo({
      url: '../webview/webview?href='+app.globalData.url+'/oss/alive/user-protocol.html',
    })
  },
  loginWx: function () {
    var that=this
    wx.request({
      url: app.globalData.url+'/oss/alive/user-protocol.html',
      success:function(res){
        console.log(res.data)
        var article=res.data
        WxParse.wxParse('article', 'html',article, that, 5);
      }
    })
    if (!that.data.selectAgree){
      wx.showToast({
        title: '请勾选登录协议',
        icon: 'loading',
        duration: 1000
      })
    }else{
      that.setData({
        showIs: true
      })
    }
    
  },
  loginPhone: function (e) {
    this.setData({
      key: e.detail.value,
    })
  },
  code: function (e) {
    this.setData({
      code: e.detail.value,
    })
  },
  // 获取验证码
  timeBack() {
    var that = this
    var timer = setInterval(function () {
      var time = that.data.time - 1;
      that.setData({
        times: time + ' s',
        time: time
      })
      if (that.data.time == 0) {
        clearInterval(timer);
        that.setData({
          times: '获取验证码',
          time: 60
        })
      }
    }, 1000);
  },
  smsvcodeGet(e) {
    var that = this
    if (that.data.key == '' || that.data.key.length < 11) {
      wx.showToast({
        title: '请填写正确手机号',
        icon: 'loading'
      })
    } else if (that.data.times != '获取验证码') {
      return
    } else {
      that.setData({
        time: 60
      })
      wx.request({
        url: app.globalData.url + '/sendsmsvcode',
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: 'post',
        data: {
          phone: that.data.key,
        },
        success: function (res) {
          wx.hideToast()
          if (res.data.code == 0) {
            that.timeBack()
          } else {
            wx.showToast({
              title: res.data.codeMsg
            })
          }
        }
      })
    }
  },
  login(e) {
    var that = this
    if (!that.data.selectAgree){
      wx.showToast({
        title: '请勾选登录协议',
        icon: 'loading',
        duration: 1000
      })
    }else{
      if (app.globalData.loginHospitalId == '') {
        // wx.showModal({
        //   title: '请选择登录医院',
        //   showCancel: false,
        //   success(res) {
        //     if (res.confirm) {
        //       wx.navigateTo({
        //         url: '../hosList/hosList',
        //       })
        //     }
        //   }
        // })
        wx.showToast({
          title: '选择登录医院',
          icon: 'none',
          duration: 2000,
          mask:true,
          complete: function complete(res){
            setTimeout(function(){
              wx.navigateTo({
                        url: '../hosList/hosList',
                      })
            },500);
          }
        });
      } else if (that.data.key == '' || that.data.code == '') {
        wx.showToast({
          title: '请填写完整',
          duration: 1000,
          icon: 'loading'
        })
      }else{
        wx.request({
          url: app.globalData.url + '/user/login-by-smsvcode',
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: 'post',
          data: {
            phone: that.data.key,
            smsvcode: that.data.code,
            loginHospitalId: app.globalData.loginHospitalId,
          },
          success: function (res) {
            wx.hideToast()
            if (res.data.code == 0) {
              wx.showToast({
                title: '操作成功',
                icon: 'loading'
              })
              app.globalData.cookie = res.header['Set-Cookie']
              wx.request({
                url: app.globalData.url + '/user/login-refresh',
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  'cookie': app.globalData.cookie
                },
                method: 'post',
                success: function (res) {
                  wx.hideToast()
                  if (res.data.code == 0) {
                    app.globalData.userInfoDetail = res.data.data
                    app.globalData.loginHospitalId = res.data.data.hospitalId,
                      app.globalData.loginHpitalName = res.data.data.hospitalName
                    if (that.data.type == 1) {
                      wx.navigateBack({})
                    } else {
                      wx.switchTab({
                        url: '../index/index',
                      })
                    }
                  } else {
                    wx.showToast({
                      title: res.data.codeMsg,
                      icon: 'loading'
                    })
                  }
                }
              })
            }else {
              wx.showToast({
                title: res.data.codeMsg,
                icon: 'loading'
              })
            }
          }
        })
      }
  
    }
    
    
   
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      type: options.type,
      href:app.globalData.url
    })
    if(options.from!=1){
      wx.login({
        success(res) {
          console.log(res.code);
          var code = res.code
          that.setData({
            code: code
          })
          wx.request({
            url: app.globalData.url + '/user/login-by-wxminapp',
            header: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            method: 'post',
            data: {
              wsJsCode: code,
              // phone: that.data.key,
              // smsvcode:that.data.code,
              loginHospitalId: app.globalData.loginHospitalId,
            },
            success: function (res) {
              wx.hideToast()
              if (res.data.code == 0) {
                wx.showToast({
                  title: '登录中',
                  icon:"none"
                })
                app.globalData.cookie = res.header['Set-Cookie']
                wx.request({
                  url: app.globalData.url + '/user/login-refresh',
                  header: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    'cookie': app.globalData.cookie
                  },
                  method: 'post',
                  success: function (res) {
                    wx.hideToast()
                    if (res.data.code == 0) {
                      app.globalData.userInfoDetail = res.data.data
                      app.globalData.loginHospitalId = res.data.data.hospitalId,
                        app.globalData.loginHpitalName = res.data.data.hospitalName
                      if (that.data.type == 1) {
                        wx.navigateBack({})
                      } else {
                        wx.switchTab({
                          url: '../index/index',
                        })
                      }
  
                    } else {
                      wx.showToast({
                        title: res.data.codeMsg,
                        icon: 'loading'
                      })
                    }
                  }
                })
              } else if (res.data.code == 27) {
                if(app.globalData.loginHospitalId==''){
                  wx.showToast({
                    title: '选择登录医院',
                    icon: 'none',
                    duration: 2000,
                    mask:true,
                    complete: function complete(res){
                      setTimeout(function(){
                        wx.navigateTo({
                                  url: '../hosList/hosList',
                                })
                      },500);
                    }
                  });
                }         
              } else {
                wx.showToast({
                  title: res.data.codeMsg,
                  icon: 'loading'
                })
              }
            }
          })
  
        }
      })
    }
  

  },
  refuse(e) {
    this.setData({
      showIs: false
    })
  },
  getPhoneNumber(e) {

    wx.login({
      success(res) {
        console.log(res.code);
        var code = res.code
        wx.request({
          url: app.globalData.url + '/user/login-by-wxminapp',
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: 'post',
          data: {
            wsJsCode: code,
            loginHospitalId: app.globalData.loginHospitalId,
            wxMinappencryptedDataOfPhoneNumber: e.detail.encryptedData,
            wxMinappIv: e.detail.iv,
          },
          success: function (res) {
            wx.hideToast()
            if (res.data.code == 0) {
              wx.showToast({
                title: '操作成功',
                icon: 'loading'
              })
              app.globalData.cookie = res.header['Set-Cookie']
              wx.request({
                url: app.globalData.url + '/user/login-refresh',
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  'cookie': app.globalData.cookie
                },
                method: 'post',
                success: function (res) {
                  wx.hideToast()
                  if (res.data.code == 0) {
                    app.globalData.userInfoDetail = res.data.data
                    app.globalData.loginHospitalId = res.data.data.hospitalId,
                      app.globalData.loginHpitalName = res.data.data.hospitalName
                    if (that.data.type == 1) {
                      wx.navigateBack({})
                    } else {
                      wx.switchTab({
                        url: '../index/index',
                      })
                    }

                  } else {
                    wx.showToast({
                      title: res.data.codeMsg,
                      icon: 'loading'
                    })
                  }
                }
              })

            
            } else {
              wx.showToast({
                title: res.data.codeMsg,
                icon: 'loading'
              })
            }
          }
        })
      }
    })

    var that = this
    that.setData({
      wxMinappencryptedDataOfPhoneNumber: e.detail.encryptedData,
      wxMinappIv: e.detail.iv,
    })


  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    this.setData({
      loginHpitalName: app.globalData.loginHpitalName || ''
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})