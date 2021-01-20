import { onload } from './utils'

// 过滤无效数据
function filterTime(a, b) {
  return a > 0 && b > 0 && a - b >= 0 ? a - b : undefined
}

let resolvePerformanceResource = resourceData => {
  let timing = resourceData
  let o = {
    initiatorType: timing.initiatorType, // 资源类型
    name: timing.name, // 资源名称
    duration: timing.duration, // responseend-starttime， starttime是资源开始提取的时间

    // 连接过程
    redirect: filterTime(timing.redirectEnd, timing.redirectStart), // 重定向
    dns: filterTime(timing.domainLookupEnd, timing.domainLookupStart), // DNS解析
    connect: filterTime(timing.connectEnd, timing.connectStart), // TCP建连
    network: filterTime(timing.connectEnd, timing.startTime), // 网络总耗时

    send: filterTime(timing.responseStart, timing.requestStart), // 发送开始到接受第一个返回
    receive: filterTime(timing.responseEnd, timing.responseStart), // 接收总时间
    request: filterTime(timing.responseEnd, timing.requestStart), // 总时间 f12network显示的时间

    ttfb: filterTime(timing.responseStart, timing.requestStart) // 首字节时间
  }
  return o
}

// 循环获取每一个资源的性能数据
let resolveEntries = entries => entries.map(_ => resolvePerformanceResource(_))
export default {
  init: cb => {
    // 当有动态的文件加载进来以后，会给触发此条件, 所以要把此sdk放到最上面, 如果在onload之后有动态的资源继续加载进来，那么要开启此条件，并将打包后的sdk放到index.html的最上面
    // if (window.PerformanceObserver) {
    //   let observer = new window.PerformanceObserver(list => {
    //     try {
    //       let entries = list.getEntries()
    //       let entriesData = resolveEntries(entries)
    //       cb(entriesData)
    //     } catch (error) {
    //       console.error(error)
    //     }
    //   })
    //   observer.observe({ entryTypes: ['resource'] })
    // } else {
    onload(() => {
      let entries = performance.getEntriesByType('resource')
      // resolvePerformanceResource(entries[0])
      const entriesData = resolveEntries(entries)
      cb(entriesData)
    })
    // }
  }
}
