//index.js
//获取应用实例
const app = getApp()
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var qqmapsdk;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    latitude:0,
    longitude:0,
    controlls:[],
    markers:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("生命周期");
     //实例化API核心类
     qqmapsdk=new QQMapWX({
      key:"DHMBZ-54WK3-MJW3Q-37IX6-IMF5S-AOFZZ"
    })
    //1.获取当前对象的拷贝
    var that=this
    //2.创建一个地图的上下文，对地图中打的空间进行事件操作
    that.mapCtx=wx.createMapContext('map');
    //3.获取手机所在的位置（真机是手机的真实定位，迷你器这是在sensor面板的位置）
    wx.getLocation({
      type: 'wgs84',
      isHighAccuracy:true,
      success:function(res){
        that.setData({
          latitude:res.latitude,
          longitude:res.longitude
        })
        //5.加载附近可用的10辆单车
        findNearAll(that,that.data.latitude,that.data.longitude);
      }
    })
    //4.在地图页中加入按钮
    wx.getSystemInfo({
      success:function(res){
        //获取宽高
        var height=res.windowHeight;
        var width=res.windowWidth;
        //添加控件（即图片）
        that.setData({
          controlls:[
            {
              id:1,
              position:{
                left:width/2-10,
                top:height/2-20,
                width:20,
                height:35
              },
              iconPath:"../images/location.png",
              clickable:true
            },
            {
              id:2,
              position:{
                left:10,
                top:height-75,
                width:50,
                height:50
              },
              iconPath:"../images/img1.png",
              clickable:true
            },
            {
              id:3,
              position:{
                left:width/2-60,
                top:height-75,
                width:120,
                height:50
              },
              iconPath:"../images/qrcode.png",
              clickable:true
            },
            {
              id:4,
              position:{
                left:width-55,
                top:height-75,
                width:50,
                height:50
              },
              iconPath:"../images/pay.png",
              clickable:true
            },
            { //报修
              id: 6,
              position: {
                width: 35,
                height: 35,
                left: width - 42,
                top: height - 165.
              },
              iconPath: "../images/repair.png",
              //是否可点击
              clickable: true
            }
  
          ]
        })

      }
    })

    
        
      
    

  },

  //移动地图便能获取附近的车
  regionchange(e){
    var that=this
    that.markers=[]
    if(e.type=='end'){
      that.mapCtx.getCenterLocation({
        success:function(res){
          var latitude=res.latitude;
          var longitude=res.longitude;
          //查找附近的车
          findNearAll(that,latitude,longitude);
        }
      })
    }
  },

  controltap(e) {
    var that=this;
    if(e.controlId==2){
      //地图复位
      that.mapCtx.moveToLocation();
    } else if(e.controlId==3){
      //获取全局变量status,根据它的值进行页面跳转
      //var status =getApp().globalData.status;
      var status=wx.getStorageSync('status')
      if( status==0){
        //跳到注册页面
        wx.navigateTo({
          url: '../register/register',
        });
      }else if (status == 1) {
        wx.navigateTo({
          url: '../deposit/deposit',
        });
      } else if (status == 2) {
        wx.navigateTo({
          url: '../identity/identity',
        });
      } else if (status == 3) {
        that.scanCode()
      }else if(status ==4){
        wx.navigateTo({
          url: '../billing/billing',
        });
      }

    }else if(e.controlId==4){
      wx.navigateTo({
        url: '../pay/pay',
      });
    }else if(e.controlId==6){
      wx.navigateTo({
        url: '../repair/repair',
      });
    }
  },
  scanCode:function(){
    var that=this
    wx.scanCode({
      success:function(res){
        //bid和二维码相同
        var bid=res.result
        //异步请求
        wx.request({
          url:"http://localhost:8080/ibike/open",
          method:"POST",
          data:{
            bid:bid,
            latitude:that.data.latitude,
            longitude:that.data.longitude,
            phoneNum:wx.getStorageSync('phoneNum')
          },
          dataType:"json",
          header:{
            "content-type":"application/json"
          },
          success:function(res){
            //console.log(res);
            if(  res.data.code==0){ 
              wx.showToast({
                title: '开锁失败,原因:'+res.data.msg,
                icon: "none"
              });
              return;
            }


            if(res.data.code==1){
              wx.setStorageSync('start_latitude', that.data.latitude)
              wx.setStorageSync('start_longitude', that.data.longitude)
              //在本地保存一下单车号
              wx.setStorageSync('bid' , bid);
              wx.setStorageSync('status', 4);   //表示当前用户正在骑行中...
              getApp().globalData.status = 4;  //当前骑行中.
              wx.navigateTo({
                url: '../billing/billing?bid='+bid           
               });
            }else if(  getApp().globalData.status==4){    //还在骑行中.
              wx.navigateTo({
                url: '../billing/billing',
              })
            }
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      console.log("渲染")
      //数据埋点 用于获取用户的openid 地理位置
      //获取位置
      wx.getLocation({
        success:function(res){
          //获取经纬度
          var latitude=res.latitude;
          var longitude=res.longitude;
          //获取用户标识  openid
          var openid=wx.getStorageSync('openid');
          wx.request({
            url:"http://localhost:8080/ibike/log/savelog",
            method:"POST",
            data:{
              time:new Date(),  //客户端时间
              openid:openid,
              latitude:latitude,
              longitude:longitude,
              url:"index"
            }
          })


        }
      })

  }
})
function findNearAll(that,latitude,longitude){
  //5.加载附近可用的10辆单车
  wx.request({
    url:"http://localhost:8080/ibike/findNearAll",
    method:"POST",
    data:{
      latitude:latitude,
      longitude:longitude,
      status:1
    },
    success:function(res){
      const bikes=res.data.obj.map(item=> {
        return{
          bid: item.bid,
           iconPath:"../images/bike.png",
           width:35,
           height:35,
           latitude:item.latitude,
           longitude:item.longitude
        }
      });
      that.setData({
        markers:bikes
      })
    }
  })
}
