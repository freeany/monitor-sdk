// 通过分模块的方式， 可以使用需要的模块。 让sdk具有更好的可维护性。
import perf from './perf'
import resource from './resource'
import xhrHook from './xhrHook'
import catchError from './catchError'

// perf.init(() => {
//   console.log('perf监测启动')
// })

// resource.init(resourceData => {
//   console.log('resource监测启动')
//   console.log(resourceData)
// })

// xhrHook.init(data => {
//   console.log(data)
// })

catchError.init(data => {
  console.log(data)
  console.log('catchError is start')
})

console.log('hello world 123')
