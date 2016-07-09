# HTML5 + Go 二维码扫描

## 开发环境准备

### iris 命令

```
go get -u github.com/kataras/iris/iris
```

### 项目依赖

```
glide get github.com/kataras/iris/iris
glide get github.com/iris-contrib/middleware/logger
glide get github.com/iris-contrib/middleware/recovery
```

### zbar lib

```
sudo apt-get install libzbar-dev
glide get gopkg.in/bieber/barcode.v0
```
