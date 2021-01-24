// 通过分模块的方式， 可以使用需要的模块。 让sdk具有更好的可维护性。
import perf from './perf'
import resource from './resource'
import xhrHook from './xhrHook'
import catchError from './catchError'

perf.init(data => {
  console.log('perf监测启动')
  console.log(data)
})

resource.init(resourceData => {
  console.log('resource监测启动')
  console.log(resourceData)
})

xhrHook.init(data => {
  console.log('接口性能监控')
  console.log(data)
})

catchError.init(data => {
  console.log('错误监控')
  console.log(data)
})

console.log('hello world 123')
