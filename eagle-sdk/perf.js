export default {
  init: cb => {
    cb()

    let isDOMReady = false
    let isOnload = false
    let cycleTime = 100

    let Util = {
      getPerfData: p => {
        let data = {
          // 网络建联
          prevPage: p.fetchStart - p.navigationStart, // 上一个页面的卸载时间
          redirect: p.redirectEnd - p.redirectStart, // 重定向时间
          dns: p.domainLookupEnd - p.domainLookupStart, // DNS查找时间
          connect: p.connectEnd - p.connectStart, // TCP建联时间
          network: p.connectEnd - p.navigationStart, // 网络总耗时， 前面的加起来

          // 网络接收
          send: p.responseStart - p.requestStart, // 前端从发送到接收的时间
          receive: p.responseEnd - p.responseStart, // 请求数据用时
          request: p.responseEnd - p.requestStart, // 请求页面的总耗时

          // 前端渲染
          dom: p.domComplete - p.domLoading, // dom解析时间
          loadEvent: p.loadEventEnd - p.loadEventStart, // loadEvent时间
          frontend: p.loadEventEnd - p.domLoading, // 前端总时间

          // 关键阶段
          load: p.loadEventEnd - p.navigationStart, // 页面完全加载时间
          domReady: p.domContentLoadedEventStart - p.navigationStart, // dom准备时间
          interactive: p.domInteractive - p.navigationStart, // 可操作时间，用户的点击可以被响应了
          ttfb: p.responseStart - p.navigationStart // 首字节时间
        }
        return data
      },
      // dom解析完成, DOMContentLoaded事件触发， 如果没有这个则要在load事件中加上settimeout
      // 在正常环境下  loadEvent  frontend  load一般来说是负值， 但是在小网页中，load事件发生的太快了，导致loadEvent有值，所以是正值的情况， 在onload之前运行
      domReady: callback => {
        if (isDOMReady) return
        let timer = null

        // 每100ms递归一次runCheck， 检查dom是否加载完成
        let runCheck = () => {
          if (performance.timing.domComplete) {
            // 这个可以判断dom加载完成了
            // 如果监测到dom解析完成，则停止循环监测，运行callback
            clearTimeout(timer)
            callback()
            isDOMReady = true
          } else {
            // 再去循环检测
            timer = setTimeout(runCheck, cycleTime)
          }
        }
        // 文档解析完成
        if (document.readyState === 'interactive') {
          // 这个也可以判断dom加载完成了
          callback()
          return void 0
        }

        document.addEventListener('DOMContentLoaded', () => {
          // 案例来说这个也可以判断dom加载完成了，但是说并没有，这就不懂了
          runCheck()
        })
      },
      // 页面加载完成， onload事件触发
      onload: callback => {
        if (isOnload) return
        let timer = null

        // 每100ms递归一次runCheck， 检查dom是否加载完成
        let runCheck = () => {
          if (performance.timing.loadEventEnd) {
            // 这个可以判断dom加载完成了
            // 如果监测到dom解析完成，则停止循环监测，运行callback
            clearTimeout(timer)
            callback()
            isOnload = true
          } else {
            // 再去循环检测
            timer = setTimeout(runCheck, cycleTime)
          }
        }
        // 文档解析完成
        if (document.readyState === 'interactive') {
          // 这个也可以判断dom加载完成了
          callback()
          return void 0
        }

        window.addEventListener('load', () => {
          // 案例来说这个也可以判断dom加载完成了，但是说并没有，这就不懂了
          runCheck()
        })
      }
    }

    let performance = window.performance

    Util.domReady(() => {
      let perfData = Util.getPerfData(performance.timing)
      perfData.type = 'domready'
      // 获取到此数据，应该给sdk上层， 去上传这个数据
    })

    Util.onload(() => {
      let perfData = Util.getPerfData(performance.timing)
      perfData.type = 'onload'
      // 获取到此数据，应该给sdk上层， 去上传这个数据
    })

    // document.addEventListener('DOMContentLoaded', () => {})

    // window.addEventListener('load', () => {
    //   // 为什么加settimeout 因为要保证load事件结束， 因为这些值都是固定值，所以settimeout不会对结果产生影响
    //   // setTimeout(() => {
    //   // console.log(performance.timing)
    //   let perfData = Util.getPerfData(performance.timing)
    //   debugger
    //   // }, 3000)
    // })
  }
}
