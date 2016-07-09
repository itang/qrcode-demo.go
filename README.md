# HTML5 + Go 二维码扫描


## 运行

```
$ go get -u github.com/kataras/iris/iris
$ git clone git@github.com:itang/qrcode-demo.go.git
$ cd qrcode-demo.go
$ glide update
$ iris run
```

打开浏览器访问: `http://localhost:8080/public/index.html`, 通过摄像头扫描二维码图形进行识别.

## 参考

https://webqr.com/


## 开发环境准备

### iris 命令

```
go get -u github.com/kataras/iris/iris
```

### zbar lib

Ubuntu 下
```
sudo apt-get install libzbar-dev

```

### 主要的Go packages

```
glide get github.com/kataras/iris/iris
glide get github.com/iris-contrib/middleware/logger
glide get github.com/iris-contrib/middleware/recovery
glide get github.com/gorilla/websocket
glide get gopkg.in/bieber/barcode.v0
```

