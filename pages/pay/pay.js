// pages/pay/pay.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    monet:0, //余额
    currentTab:3,  //选中默认的标签
    payMoney:10
  },
  switchNav:function(e){
    var that=this
    if(that.data.currentTab==e.target.dataset.current){
      return false;
    }else{
      that.setData({
        currentTab:e.target.dataset.current,
        payMoney: e.target.dataset.money

      })
    }
  },

  recharge:function(){
    var phoneNum=wx.getStorageSync('phoneNum')
    if(phoneNum==null || phoneNum==""){
      wx.showToast({
        title:'您还没有登录',
        icon:'none'
      })
      return;
    }

    var that=this
    //充值提示框  模式对话框
    wx.showModal({
      title:'充值',
      content:"您是否进行充值"+that.data.payMoney+"元？",
      success:function(res){
        if(res.confirm){
          //发送请求连接
          var openid=wx.getStorageSync('openid');
          var amount=that.data.payMoney;
          wx.request({
            url: 'http://localhost:8080/ibike/recharge',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
              balance: amount,
              phoneNum: phoneNum
            },
            method:'POST',
            success:function(res){
              if(res.data.code==1) {
                wx.showModal({
                  title: '提示',
                  content: '充值成功！',
                  success: function(res) {
                    if (res.confirm) {
                      wx.navigateTo({
                        url: '../index/index',
                      })
                    }
                  }
                })
              }
            }
          })
        }
      }
    })

  }
})