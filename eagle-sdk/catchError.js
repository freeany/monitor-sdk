let formatError = errObj => {
  let col = errObj.column || errObj.columnNumber // Safari Firefox 浏览器中才有的信息
  let row = errObj.line || errObj.lineNumber // Safari Firefox   浏览器中才有的信息
  let message = errObj.message
  let name = errObj.name

  let { stack } = errObj
  if (stack) {
    let matchUrl = stack.match(/https?:\/\/[^\n]+/) // 匹配从http?s 开始到出现换行符的信息, 这个不仅包括报错的文件信息而且还包括了报错的行列信息
    let urlFirstStack = matchUrl ? matchUrl[0] : ''
    // 获取到报错的文件
    let regUrlCheck = /https?:\/\/(\S)*\.js/

    let resourceUrl = ''
    if (regUrlCheck.test(urlFirstStack)) {
      resourceUrl = urlFirstStack.match(regUrlCheck)[0]
    }

    let stackCol = null // 获取statck中的列信息
    let stackRow = null // 获取statck中的行信息
    let posStack = urlFirstStack.match(/:(\d+):(\d+)/) // // :行:列
    if (posStack && posStack.length >= 3) {
      ;[, stackCol, stackRow] = posStack
    }

    // TODO formatStack
    return {
      content: stack,
      col: Number(col || stackCol),
      row: Number(row || stackRow),
      message,
      name,
      resourceUrl
    }
  }

  return {
    row,
    col,
    message,
    name
  }
}

let frameError = async errObj => {
  const result = await $.get(`http://localhost:3000/sourcemap?col=${errObj.col}&row=${errObj.row}`)
  return result
}

let errorCatch = {
  init: cb => {
    let _originOnerror = window.onerror
    window.onerror = async (...arg) => {
      let [errorMessage, scriptURI, lineNumber, columnNumber, errorObj] = arg
      let errorInfo = formatError(errorObj)
      // 如果是使用webpack打包的框架代码报错，在处理一次，这里暂时使用resourceUrl字段进行区分是否是框架代码报错
      if (errorInfo.resourceUrl === 'http://localhost:3000/react-app/dist/main.bundle.js') {
        let frameResult = await frameError(errorInfo)

        errorInfo.col = frameResult.column
        errorInfo.row = frameResult.line
        errorInfo.name = frameResult.name
        errorInfo.source = frameResult.source
        errorInfo.sourcesContentMap = frameResult.sourcesContentMap
      }

      errorInfo._errorMessage = errorMessage
      errorInfo._scriptURI = scriptURI
      errorInfo._lineNumber = lineNumber
      errorInfo._columnNumber = columnNumber
      errorInfo.type = 'onerror'
      cb(errorInfo)
      _originOnerror && _originOnerror.apply(window, arg)
    }

    let _originOnunhandledrejection = window.onunhandledrejection
    window.onunhandledrejection = (...arg) => {
      let e = arg[0]
      let reason = e.reason
      cb({
        type: e.type || 'unhandledrejection',
        reason
      })
      _originOnunhandledrejection && _originOnunhandledrejection.apply(window, arg)
    }

    // 资源加载错误， 但不是js抛出的错误，
    window.addEventListener(
      'error',
      event => {
        // 过滤js error
        let target = event.target || event.srcElement
        let isElementTarget =
          target instanceof HTMLScriptElement ||
          target instanceof HTMLLinkElement ||
          target instanceof HTMLImageElement
        if (!isElementTarget) return false
        // 上报资源地址
        let url = target.src || target.href
        cb({
          url
        })
      },
      true
    )
  }
}

export default errorCatch
