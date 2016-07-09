package main

import (
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"image/png"
	"log"
	"net/http"
	"os"
	"strings"

	gws "github.com/gorilla/websocket"
	"github.com/iris-contrib/middleware/logger"
	"github.com/iris-contrib/middleware/recovery"
	"github.com/kataras/iris"
	"github.com/kataras/iris/websocket" //go1.7下, 跑不通, 待确认
	"gopkg.in/bieber/barcode.v0"
)

func main() {
	// Middleware
	iris.Use(recovery.New(os.Stderr))
	iris.Use(logger.New(iris.Logger))

	// Get theme
	iris.StaticServe("./public", "/public")

	// the path which the websocket client should listen/registed to ->
	iris.Config.Websocket.Endpoint = "/ws"
	ws := iris.Websocket // get the websocket server
	//在golang 1.7下工作有问题??
	ws.OnConnection(func(c websocket.Connection) {
		fmt.Println("client: " + c.ID() + " connected")
		//c.To(websocket.Broadcast).EmitMessage([]byte("client: " + c.ID() + " connected"))
		c.OnMessage(func(message []byte) {
			ret, err := decodeFromImgDataUrl(string(message))
			if err != nil {
				fmt.Printf("error:%v\n", err)
				c.EmitMessage([]byte(err.Error()))
			} else {
				c.EmitMessage([]byte(ret))
			}
		})

		c.OnError(func(err string) {
			fmt.Println("websocket error: ", err)
		})

		c.OnDisconnect(func() {
			fmt.Printf("\nConnection with ID: %s has been disconnected!", c.ID())
		})
	})

	go func() {
		fmt.Println("listen on :8080...")
		iris.Listen(":8080")
	}()

	http.HandleFunc("/ws", wsHandler)
	log.Fatal(http.ListenAndServe(":8081", nil))
}

var upgrader = gws.Upgrader{CheckOrigin: func(r *http.Request) bool {
	return true //允许跨域
}} // use default options

func wsHandler(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		//log.Printf("recv: %s", message)

		ret, err := decodeFromImgDataUrl(string(message))
		if err != nil {
			fmt.Printf("error:%v\n", err)
			c.WriteMessage(mt, []byte(err.Error()))
		} else {
			c.WriteMessage(mt, []byte(ret))
		}
	}
}

func decodeFromImgDataUrl(dataUrl string) (ret string, err error) {
	fmt.Println("dataUrl", dataUrl)
	arr := strings.Split(string(dataUrl), ",")
	//fmt.Printf("arr:%v\n", arr)

	var imageContent string
	if len(arr) > 0 {
		imageContent = arr[1]
	} else {
		return "", errors.New("输入格式有误")
	}

	byteData, err := base64.StdEncoding.DecodeString(imageContent)
	if err != nil {
		return
	}

	fmt.Println("len:", len(byteData))

	src, err := png.Decode(bytes.NewReader(byteData))

	if err != nil {
		return
	}

	img := barcode.NewImage(src)
	scanner := barcode.NewScanner().SetEnabledAll(true)

	symbols, _ := scanner.ScanImage(img)
	for _, s := range symbols {
		fmt.Println(s.Type.Name(), s.Data, s.Quality, s.Boundary)
	}

	if len(symbols) > 0 {
		ret = symbols[0].Data
		fmt.Println("get result:", ret)

		return
	} else {
		return "", errors.New("无法识别")
	}
}
