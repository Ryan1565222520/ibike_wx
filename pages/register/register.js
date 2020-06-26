// pages/register/register.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    countryCodes:["86","80","84","87"],
    countryCodeIndex:0,
    phoneNum:""
  },

  bindCountryCodeChange:function(e){
    this.setData({
      countryCodeIndex:e.detail.value
    })
  },

  inputPhoneNum:function(e){
    this.setData({
      phoneNum:e.detail.value
    })
  },

  genVerifyCode:function(e){
    var index=this.data.countryCodeIndex;
    var countryCode=this.data.countryCodes[index];
    var phoneNum=this.data.phoneNum

    wx.request({
      url: 'http://localhost:8080/ibike/genCode',
      header:{'content-type':'application/x-www-form-urlencoded'},
      data:{
        nationCode:countryCode,
        phoneNum:phoneNum
      },
      method:"POST",
      success:function(){
        wx.showToast({
          title: '验证码已发送',
          icon:'success'
        });
      }
    });
  },
  formSubmit(e) {
    //form发生了submit事件，携带数据为： {phoneNum: "1707339505", verifyCode: "4669"}
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var phoneNum=e.detail.value.phoneNum
    var verifyCode=e.detail.value.verifyCode
    var openid=wx.getStorageSync('openid')
    wx.request({
      url: 'http://localhost:8080/ibike/verify',
      header:{'content-type':'application/x-www-form-urlencoded'},
      data:{
        phoneNum:phoneNum,
        verifyCode:verifyCode,
        status:1,
        openid:openid
      },
      method:"POST",
      success:function(res){
        console.log(res)
        if(res.data.code==0){
          wx.showModal({
            title:'提示',
            content:'注册用户失败，原因'+res.data.msg+'!',
            showCancel:false
          })
          return;
        }
        getApp().globalData.phoneNum=phoneNum
        getApp().globalData.status=1
        wx.setStorageSync('phoneNum', phoneNum);
        console.log("phoneNUm"+phoneNum)
        wx.setStorageSync('status', 1);
        wx.navigateTo({
          url: '../deposit/deposit',
        });
        
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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