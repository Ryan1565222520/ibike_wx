// pages/pay/pay.js
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    monet:0, //余额
    currentTab:3,  //选中默认的标签
    payMoney:10
  },
  onLoad: function (options) {
    //实例化API核心类
    qqmapsdk=new QQMapWX({
      key:"DHMBZ-54WK3-MJW3Q-37IX6-IMF5S-AOFZZ"
    })
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
                
                addLog(phoneNum,amount,openid);


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
function addLog(phoneNum,amount,openid){
  //充值的数据埋点
  wx.getLocation({
    success:function(res){
      var latitude=res.latitude;
      var longitude=res.longitude;

      //埋点：记录用户的充值的行为信息，以后做数据分析  
      //请求腾讯地图api查找省市区
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: latitude,
          longitude: longitude
        },
        success:function(res){
          console.log("腾讯地图的结果"+res);
          var address=res.result.address_component;
          var province=address.province;
          var city=address.city;
          var district=address.city;
          var street=address.street;
          var street_number=address.street_number;
          var dt=new Date();
          var payTime=Date.parse(dt);

          wx.request({
            url: 'http://localhost:8080/ibike/log/addPayLog',
            method:'POST',
            data:{
              openid:openid,
              amount:amount,
              phoneNum:phoneNum,
              latitude:latitude,
              longitude:longitude,
              province:province,
              city:city,
              district:district,
              street:street,
              street_number:street_number,
              payTime:payTime
            }
          })
        }


      })
    }
  })
}