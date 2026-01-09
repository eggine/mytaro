# 任务
写一个nodejs脚本，读取当前目录下的jpg图片，生成descp.json

# 输出
每个图片对应json数组中的一个对象。每个对象都有4个字段：img, content, norm, reve。
其中img对应图片文件名，其它字段是空字符串。
```json
[
    {
        "img": "xxxxx.jpg",
        "content": "",
        "norm":"",
        "reve":""
    },
    ....
]
```