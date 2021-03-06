// pages/repair/repair.js
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bikeNo:'',
    types:[]
  },
  onLoad: function (options) {
    //实例化API核心类
    qqmapsdk=new QQMapWX({
      key:"DHMBZ-54WK3-MJW3Q-37IX6-IMF5S-AOFZZ"
    })
  },
  scanCode:function(e){
    var that=this;
     //扫码功能
     //用软件生成一个测试二维码: www.liantu.com
     // 比如:  http://localhost:8080/00000001
     //请注意:上线后，微信要求访问的协议必须是 https
     //且不能有端口号( 即https 443)
     wx.scanCode({
       success:function(r){
         var code=r.result;
         console.log("报修的单车码"+code);
         that.setData({
           bikeNo:code
         })
       }
     })


  },

  //复选框的点击事件
  checkboxChange:function(e){
    var values=e.detail.value; //当前选择的那个值
    console.log("选择的故障"+values);
    this.setData({
      types:values
    })
  },
  formSubmit:function(e){
    var that=this;
    var bikeNo = e.detail.value.bikeNo;
    //也可以
    //var bikeNo=this.data.bikeNo;
    var types=that.data.types;
    var phoneNum=wx.getStorageSync('phoneNum');
    var openid=wx.getStorageSync('openid');
   wx.getLocation({
     success:function(res){
       var latitude=res.latitude;
       var longitude=res.longitude;
       //1.向业务系统发生请求，将车辆的状态置位报修
       report(that,bikeNo,types ,phoneNum, openid,latitude, longitude);
       //TODO: 2.数据埋点  向日志系统记录log
       addLog(bikeNo,types ,phoneNum, openid,latitude, longitude);
     }
   })
  },


})

function report(that,bikeNo,types ,phoneNum, openid,latitude, longitude) {
    wx.request({
      url: 'http://localhost:8080/ibike/repair',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method:'POST',
      data:{
        phoneNum:phoneNum,
        bid:bikeNo,
        types:types,
        openid:openid,
        latitude:latitude,
        longitude:longitude
      },
      success:function(res){
        console.log( res );
        if( res.data.code==1){
          wx.showModal({
            title: '提示',
            content: '报修成功，谢谢！',
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

function  addLog(bikeNo,types ,phoneNum, openid,latitude, longitude){
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
      var Time=Date.parse(dt);

      wx.request({
        url: 'http://localhost:8080/ibike/log/addRepairLog',
        method:'POST',
        data:{
          opneid:openid,
          types:types,
          phoneNum:phoneNum,
          bid:bikeNo,
          latitude:latitude,
          longitude:longitude,
          province:province,
          city:city,
          district:district,
          street:street,
          street_number:street_number,
          Time:Time
        }
      })
    }
  })
}