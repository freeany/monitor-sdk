- 技术监控
  1.  页面性能监控
  2. 静态资源性能监控
  3. 错误监控
  4. 接口性能监控

- 行为监控
  1. 用户行为路径
  2. 打点监控
  3. 大量log上报策略
  4. 时效策略

performance api google

https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceTiming 该数据通过window.performance.timing获取

首字节： 浏览器接收到的首个字节（后端的首次返回的性能）

|            性能            |            含义            |   默认值   |                             备注                             |
| :------------------------: | :------------------------: | :--------: | :----------------------------------------------------------: |
|       navigatorStart       |    前一个网页卸载的时间    | 毫秒时间戳 | 1. 有前一个网页:发生unload事件时的Unix毫秒时间戳 2. 没有前一个网页: fetchStart |
|      uploadEventStart      | 前一个网页的unload事件开始 |     0      |                                                              |
|       unloadEventEnd       | 前一个网页的unload事件结束 |     0      |                                                              |
|       redirectStart        |       重定向开始时间       | 0(不同域)  |                           需要同域                           |
|        redirectEnd         |       重定向结束时间       | 0(不同域)  |                           需要同域                           |
|                            |                            |            |                                                              |
|         fetchStart         |        开始请求网页        |            |                                                              |
|     domainLookupStart      |        DNS查询开始         |            |                                                              |
|      domainLookupEnd       |        DNS查询结束         |            |                                                              |
|        connectStart        |    向服务器建立握手开始    |            |                                                              |
|         connectEnd         |    向服务器建立握手结束    |            |                                                              |
|   secureConnectionStart    |        安全握手开始        |            |                      非https的没有即为0                      |
|        requestStart        |    向服务器发送请求开始    |            |       没有end，因为无法在浏览器端监控到请求结束的时间        |
|       responseStart        |     服务器返回数据开始     |            |                                                              |
|        responseEnd         |     服务器返回数据结束     |            |             如果http链接关闭了才会返回此数据的值             |
|                            |                            |            |                      以上是服务器相关的                      |
|         domLoading         |        解析dom开始         |            |                document.readyState 为 loading                |
|       domInteractive       |        解析dom结束         |            |              document.readyState 为 interactive              |
| domContentLoadedEventStart |    DOMContentLoaded开始    |            |               和domInteractive返回的时间戳一样               |
|  domContentLoadedEventEnd  |    DOMContentLoaded结束    |            |                                                              |
|        domComplete         |        文档解析完成        |            |          不仅dom加载完毕，dom中所有资源也都加载完毕          |
|       loadEventStart       |       load事件发送前       |            |                   触发onload时间开始的时间                   |
|        loadEventEnd        |       load事件发送后       |            |                     onload回调结束的时间                     |



只要有回调函数的事件基本都是有start和end，start是触发事件的时间，end是执行完回调的时间。

onLoad会等待页面所有的资源都加载完成

domContentLoad只会等待dom结构加载完成就触发。图片、样式、js这些都不管的

document.readyState;

 	1. `loading`**（正在加载）**
      	1. [`document`](https://developer.mozilla.org/zh-CN/docs/Web/API/Document) 仍在加载。
	2. `interactive`**（可交互）**
    	1. 文档已被解析，"**正在加载**"状态结束，但是诸如图像，样式表和框架之类的子资源仍在加载。
	3. `complete`**（完成）**
    	1. 文档和所有子资源已完成加载。表示 `load` 状态的事件即将被触发。

https://blog.csdn.net/jamal117/article/details/58697954





performance.getEntries().  做资源监控的， 通过这个api可以对所有的资源进行监控。得到需要的数据



**第一字节时间**（TTFB）是指从浏览器请求页面到从浏览器接收来自服务器发送的信息的第一个字节的时间。这一次包括DNS查找和使用（三次）[TCP](https://developer.mozilla.org/en-US/docs/Glossary/TCP)握手和[SSL](https://developer.mozilla.org/en-US/docs/Glossary/SSL_Glossary)握手建立连接（如果请求是通过[https](https://wiki.developer.mozilla.org/en-US/docs/Glossary/https)发出的）。

TTFB是从请求开始到响应开始之间所用的时间，以毫秒为单位



策略： 比如大量的数据传到后端，但是要过滤掉一些请求，是前端处理还是后端处理？如果是后端处理的话，那么前端发送到后端还是会有大量的http连接，占用了后端的资源，如果前端处理 的话，则要写死过滤几个过滤的条件，也不合适，这时候 有一种策略就是前端在处理数据之前向后端请求一个配置文件，前端根据配置文件去过滤数据，这样既保证了过滤条件的可配置性，也保证了不会建立大量的htpp请求。





当被webpack打包后的文件 错误捕获的话会捕获打包后的文件，而非我们写的业务代码。所以需要用sourcemap进行处理

流程： 你把行和列都告诉sourcemap实例，它通过打包后的xxx.map文件这个参数构造sourcemap的实例，把正常文件的所有内容返回给你，然后你自己处理数据。