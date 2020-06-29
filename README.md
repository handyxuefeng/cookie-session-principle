# cookie-session-principle
cookie-session-localstorage-sessionstorage
## cookie  和 session 和 localstoreage 的区别
- localStoreage 和 sessionStorage 本地存储（发送请求的的时候不会携带）
- localStorage 浏览器关闭之后不会销毁掉，要手动销毁，sessionStorage 会随着浏览器页签关闭之后销毁掉
- localStorage 和 SessionStorage 是不能跨域的

- cookie 既可以在浏览器端设置，要可以在服务端设置，每次请求的时候，会随着请求头一起发送到服务端,有大小限制 4KB

## JWT 
- jwt 是json web token的简称，不存在服务端
