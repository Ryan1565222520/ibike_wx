// pages/billing/billing.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hours: 0,
    minuters: 0,
    seconds: 0,    
    billing: "正在计费",    //提示文字/金额
    bid:''     //车号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.bid);  //注意无状态问题，
    console.log(  wx.getStorageSync('bid') ); //最好用它来取bid
    var that=this;
    wx.setStorageSync('time', true);
    // 获取车牌号，设置定时器
    this.setData({
      bid: wx.getStorageSync('bid'),
      timer: this.timer    //定时器
    });

    // 初始化计时器
    let s = 0;   //秒
    let m = 0;   //分
    let h = 0;  //小时

    //如果原来保存了时间，则从原来的时间继续向下计时
    if(  wx.getStorageSync('start_time') ){
        console.log("是否有原来的时间:有");
        var st=wx.getStorageSync('start_time');
        var startDate=new Date(parseInt(st) * 1000);
         var hs = startDate.getHours();
         var mms = startDate.getMinutes();
         var ss = startDate.getSeconds();
         console.log(  "hs:"+hs+",mms:"+mms+",ss:"+ss);
        var nowDate=new Date();
        console.log("开始的时间："+startDate+"现在的时间："+nowDate)
        var res=dateDif( startDate, nowDate);
        s=res.S;
        m=res.M;
        h=res.H;
    } 
     //获取开始的时间
     var tmp = Date.parse(new Date()).toString();
     console.log("开始时间为:"+ tmp );
     tmp = tmp.substr(0, 10);
     if(  ! wx.getStorageSync('start_time')  ){
       wx.setStorageSync('start_time', tmp);
     }
     console.log("开始时间取前10位为:"+ tmp );
     //TODO: 向服务器发一个请求，记录这个车的开始时间，车号,用户openid,电话, 。
     //计时开始
     this.timer=setInterval(  ()=>{
         this.setData({
          minuters:m,
          hours:h,
          seconds: s++
         });
         if( s==60){
           s=0;
           m++;
           setTimeout(  ()=>{
              this.setData({
                  minuters:m,
                  hours:h,
                  seconds: s
              });
           },1000  );
         }
         if(  m==60 ){
           m=0;
           h++;
           setTimeout( ()=>{
                this.setData({
                      hours:h,
                      minuters:m,
                      seconds: s
                });
           },1000);
         }
     },1000);   //每一秒执行  () 函数    ,这个函数累计,累计的结果要修改

  },



moveToIndex:function(e){
  wx.navigateTo({
    url: '../index/index',
  })
},


//j结束骑行，清除定时器，想后台发送请求，穿足够的参数
endRide:function(){
    //结束时间
    var tmp=Date.parse(new Date()).toString();
    tmp=tmp.substr(0,10);
    wx.setStorageSync('end_time', tmp);
    //耗时
    var times=(this.data.minuters*60+this.data.hours*60*60+this.data.seconds);
    wx.setStorageSync('time', false)
    clearInterval(this.timer)
    this.timer="";
    this.setData({
      billing:"本次骑行耗时",
      disabled:true
    });
    //获取结束时的地理位置  经纬度
    wx.getLocation({
      type: "gcj02",
      success:function(res){
        wx.setStorageSync('end_latitude', res.latitude)
        wx.setStorageSync('end_longitude', res.longitude)


         //获取用户信息
        var uuid=wx.getStorageSync('uuid');
        var openid=wx.getStorageSync('openid');
        var phoneNum=wx.getStorageSync('phoneNum');
        var bid=wx.getStorageSync('bid')
        wx.request({
          url: 'http://localhost:8080/ibike/payMoney',
          method:'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          data:{
            bid:bid,
            uuid:uuid,
            openid:openid,
            phoneNum:phoneNum,
            latitude: wx.getStorageSync('end_latitude'),
            longitude: wx.getStorageSync('end_longitude'),
            startTime:wx.getStorageSync('start_time'),
            endTime:wx.getStorageSync('end_time'),
            totalTime:times
          },
          success:function(res){
            if(res.data.code==1){
              wx.setStorageSync('start_time', undefined);
              wx.setStorageSync('end_time', undefined);
              wx.setStorageSync('bid', undefined);
              wx.setStorageSync('end_longitude', undefined);
              wx.setStorageSync('end_latitude', undefined);
              wx.setStorageSync('status', 3);
            }
          }
        })
      }
    });
  }

})

function dateDif(beginDate,endDate){
  var res={D:0,H:0,M:0,S:0,abs:true,error:false};
	//属性形式验证：第一次参数必须是Date类型，第二个参数可以为空，默认为new Date()
	if(typeof(endDate)=="undefined" || null== endDate||""==endDate ){
    endDate = new Date();
  }
	if( !(beginDate instanceof (Date)) ||  !(endDate instanceof (Date))){
		res.error=true;//"非法时间字符串";
		return res;
	}
	//比较大小，保证差值一定是正数。
	if(beginDate>endDate){
		var tempDate = beginDate;
		beginDate = endDate;
		endDate=tempDate;
		res.abs=false;//表示beginDate大于endDate
  }
  //差值: 毫秒数
	var chaTime =(endDate.getTime()-beginDate.getTime());
	var Day_Param  =1000*60*60*24;//一天等于毫秒数
	var Hour_Param = 1000*60*60;//一小时等于毫秒数
	res.D =Math.floor(chaTime/(Day_Param));//
	chaTime = chaTime-res.D*Day_Param;//减去天的毫秒数。再求小时个数
	res.H = Math.floor(chaTime/(Hour_Param));
	chaTime = chaTime-res.H*Hour_Param;//减去小时的毫秒数。再求分钟个数
	res.M = Math.floor(chaTime/(1000*60));
  res.S=parseInt( (chaTime-res.M*1000*60)/1000 );//减去分钟的毫秒数。再求秒的个数
  console.log(  beginDate+"到"+endDate+"的差值为"+ res.S);
	res.toString=function(){
		return this.D+"日"+this.H+"小时"+this.M+"分钟";
	};
	return res;	


}


