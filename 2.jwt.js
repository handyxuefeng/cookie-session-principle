// session

// 登录
// 校验是否登录过

// 内置了 设置cookie的方法
const Koa = require("koa");
const Router = require("@koa/router");
const app = new Koa();
const crypto = require("crypto");
const bodyparser = require("koa-bodyparser");
// const jwt = require('jwt-simple')
const router = new Router();
const port = 9000;
const secret = 'riafjalfjjiruioujvkhayhljjlrgjpjfalsfh4fajfo3jky3'; //签名的秘钥
const url = require('url');
const queryString = require('querystring');

app.use(bodyparser());

let jwt = {
  /**
   * base64 = eyJ1c+2VybmF+gSnV|sIDIw/MjAgMDk6MjI6MzkgR01UIn0=
   * 替换掉 base64 中 [+,/,=] 字符，防止在这些字符在浏览器传输过程中，会把 + 变成空格
   * @param {*} base64
   */
  toBase64Url(base64) {
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  },
  toBase64(content) {
    let bufferArray = Buffer.from(JSON.stringify(content)); //1.将字符串转换为二进制数组
    let tobase64Result = bufferArray.toString("base64"); // 2. 将二进制数组转换为base64
    let base64Url = this.toBase64Url(tobase64Result); //3.替换到'IjEyMzQ1Njc4OSI='  中的+, / 和 =
    //console.log("tobase64Result= ", tobase64Result, "base64Url = ", base64Url);
    return base64Url;
   
  },
  sign(content, secret) {
    let r = require("crypto") .createHmac("sha256", secret).update(content).digest("base64");
    return this.toBase64Url(r);
  },
  encode(reqContent, secret) {

    // 对head 和内容进行签名
    let header = this.toBase64({ typ: "JWT", alg: "HS256" });  //1. 默认jwt的加密头，固定写法，先转化为base64
    let content = this.toBase64(reqContent);  // 对请求的的内容先转化为 base64
    let sign = this.sign([header, content].join("."), secret);
    let result = [header, content, sign].join(".");

    console.log("加密后的结果: result = ,", result);


    return result;
  },
  base64urlUnescape(str) {
    str += new Array(5 - (str.length % 4)).join("=");
    return str.replace(/\-/g, "+").replace(/_/g, "/");
  },
  decode(token, secret) {
    let [header, content, sign] = token.split(".");
    let newSign = this.sign([header, content].join("."), secret);
    if (sign === newSign) {
      // 校验了签名
      // 将base64在转化成 字符串
      return Buffer.from(this.base64urlUnescape(content), "base64").toString();
    } else {
      throw new Error("被篡改");
    }
  },
};

// 获取用户权限
router.get("/login", async (ctx) => {
  let query = url.parse(ctx.request.url).query;
  let jsonObj = queryString.parse(query, "&", "=");
  const {username ,password} = jsonObj;

console.log("username = ", username, "password", password);
  // jsonwebtoken  jwt-simple
  if (username === "admin" && password == "admin") {
    let token = jwt.encode({
        username: username,
        expires: new Date(Date.now() + 10 * 1000).toGMTString(),
      },
      secret
    );
    ctx.cookies.set("tokenId", token);

    ctx.body = {
      err: 0,
      username,
      token,
    };
  }
});


/**
 * 利用curl发送post 请求：
 * curl -d "username=admin&password=admin" http://localhost:9000/userLogin
 */
router.post("/userLogin", async (ctx) => {
  let jsonObj = ctx.request.body; //获取post请求体的参数
  const { username, password } = jsonObj;

  console.log("username = ", username, "password", password);
  // jsonwebtoken  jwt-simple
  if (username === "admin" && password == "admin") {
    let token = jwt.encode(
      {
        username: username,
        expires: new Date(Date.now() + 10 * 1000).toGMTString(),
      },
      secret
    );
    ctx.cookies.set("tokenId", token);
    

    ctx.body = {
      err: 0,
      username,
      token,
    };
  }
});

router.get("/check", async (ctx) => {
  let tokenId = ctx.cookies.get("tokenId");
  console.log("tokenId = ", tokenId);
  try {
    let r = jwt.decode(tokenId, secret); // 这个r 表示就是你上次传入的payload

    if (r.expires < Date.now()) {
      ctx.body = "过期了";
    }

    ctx.body = {
      err: 0,
      username: r,
    };
  } catch (e) {
    console.log(e);
    ctx.body = {
      err: 1,
      message: "错误",
    };
  }
});



router.get("/validate", async (ctx) => {
  let authoraztion = ctx.headers["authorization"];
  console.log("authoraztion = ", authoraztion);
  try {
    let r = jwt.decode(authoraztion, secret); // 这个r 表示就是你上次传入的payload

    if (r.expires < Date.now()) {
      ctx.body = "过期了";
    }

    ctx.body = {
      err: 0,
      username: r,
    };
  } catch (e) {
    console.log(e);
    ctx.body = {
      err: 1,
      message: "错误",
    };
  }
});

app.use(router.routes());
app.listen(port,()=>{
    console.log(port + '启动成功。。。。')
});

// {"err":0,"username":"admin","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.ImFkbWluIg.6dCDavcMt0DglL8wQI0qsO
// PknNDPts"}*
