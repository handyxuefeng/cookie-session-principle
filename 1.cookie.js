const port = 5000;
const http = require('http');
const queryString = require('querystring');
const crypto = require('crypto');

const  serect = 'ABCDEFGH;/1232HGFEDCBA';//签名的秘钥
//对cookie内容进行签名
const sign = (cookieContent) =>{
    let newCookieContent = crypto.createHmac("sha256",serect).update(cookieContent.toString()).digest('base64');
    //console.log("newCookieContent=", newCookieContent);
    return newCookieContent;
};

//sign('linda');

http.createServer((req, res)=>{
    /**
     * 对设置cookie进行封装
    */
    let cookieArr = [];
    res.setCookie = function(key,value,options){
        let opts =[];
        //对cookie设置域名，指定这个cookie哪些域名能访问得到
        if(options.domain){
            opts.push(`domain=${options.domain}`);
        }
        //对cookie设置路径，制定页面的哪些url能访问该cookie
        if(options.path){
            opts.push(`path=${options.path}`);
        }
        //指定哪些cookie是只读的
        if(options.httpOnly) {
            opts.push(`httpOnly=${options.httpOnly}`);
        }
        //设置cookie的有效期，expries (绝对时间) max-age(相对时间，秒)
        if(options.maxAge){

            opts.push(`max-age=${options.maxAge}`);
        }

        //指定该cookie是否要加签
        if(options.signed){
            value = value + '@' + sign(value); 
        }
        cookieArr.push(`${key}=${value}; ${opts.join("; ")}`);
        res.setHeader("Set-Cookie", cookieArr);

    };

    /**
     * 获取浏览器发送的cookie
     * @param {*} key 
     * @param {*} options 
     */
    req.getCookie = function (key, options = {}) {
      let cookieObj = queryString.parse(req.headers.cookie, "; ", "=");
      if (options.signed) {
        let [value, s] = (cookieObj[key] || "").split("@"); //对传递过来的cookie 获取cookie的内容和加签码
        console.log('value = ',value , 'signed=',s);
        let newSign = sign(value);
        if (newSign === s) {
          console.log(
            "验签通过",
            "oldSign = ",
            s,
            "newSign = ",
            newSign,
            "key = ",
            key,
            "value = ",value
          );
          return cookieObj[key]; // 签名一致 说明这次的内容是没有被改过的
        } else {
          return undefined; // 签名被篡改了 不能使用了
        }
      }
      return cookieObj[key];
    };
    res.setHeader("Content-Type", "text/html ;charset=utf-8");
    if(req.url =='/read') {
        //let jsonObj = queryString.parse(req.headers.cookie,'; ','='); //读取客户端的cookie
        let uid = req.getCookie("uid") || "";
        let tokenId = req.getCookie("tokenId", { signed :true}) || "";
        let session_Id = req.getCookie("session_Id", { signed: true }) || "";
        console.log("uid= ", tokenId, "tokenId=", tokenId);
        res.end(
          `uid = ${
            uid ? uid : "该cookie已经过了有效期"
          }, tokenId = ${tokenId}, session_Id = ${
            session_Id ? session_Id : "该sessionId的内容已经被篡改"
          }`
        );
    }
    else if(req.url =='/write') {
        //设置多个cookie
        //res.setHeader('Set-Cookie',['a=1; domain=.han.com','b=2']);
        //res.setHeader("Set-Cookie", ["a=1;domain=.han.com", "b=2","tokenId=2AAL24FAFLA ;httpOnly=true"]);
        res.setCookie("tokenId", "123456789", {
          signed: true,
          httpOnly: true
        });
        res.setCookie("loginId",Date.now()*1,{httpOnly:true});
        res.setCookie("uid", "91389131", { maxAge :'20'});
        res.setCookie("session_Id", 'SessionId_1234567890',{
            httpOnly:true,
            maxAge:"10000",
            signed:true
        });

     
        res.end('cookie写入成功');
    }else{
        res.end('Not Found');
    }

}).listen(port,()=>{
    console.log(port + '启动成功。。。。')
});