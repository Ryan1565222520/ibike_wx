// pages/identity/identity.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  formSubmit:function(e){
    
    //获取全局变量的东西
    var phoneNum=getApp().globalData.phoneNum;
    var name=e.detail.value.name;
    var idNum=e.detail.value.idNum;

    wx.request({
      url: 'http://localhost:8080/ibike/identity',
      method:"POST",
      header:{'content-type':'application/x-www-form-urlencoded'},
      data:{
        phoneNum:phoneNum,
        name:name,
        idNum:idNum
      },
      success:function(res){
        if(res.data.code==1){
          getApp().globalData.status=3
          wx.setStorageSync('status', 3)
          wx.hideLoading();
          wx.navigateTo({
            url: '../index/index',
          });
        }
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