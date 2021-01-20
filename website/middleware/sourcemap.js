const fs = require('fs')
const path = require('path')
let sourceMap = require('source-map')

let sourcemapFilePath = path.join(
  __dirname,
  '../../website/client/react-app/dist/main.bundle.js.map'
)

let sourcesPathMap = {}

// webpack:///./node_modules/core-js/library/modules/_to-object.js
// webpack:///node_modules/core-js/library/modules/_to-object.js
function fixPath(filepath) {
  return filepath.replace(/\.[\.\/]+/g, '')
}

module.exports = async (ctx, next) => {
  if (ctx.path === '/sourcemap') {
    const { col, row } = ctx.query
    console.log(col, row)
    let sourceMapContent = fs.readFileSync(sourcemapFilePath, 'utf-8')
    let fileObj = JSON.parse(sourceMapContent)
    // if (ctx.path === '/sourcemap') {
    //   ctx.body = fileObj
    //   return
    // }
    let sources = fileObj.sources

    sources.map(item => {
      sourcesPathMap[fixPath(item)] = item
    })

    let findPos = {
      // line: 551,
      // column: 11
      column: parseInt(row),
      line: parseInt(col)
    }

    let findPos_ = {
      line: 10185,
      column: 489
    }

    let consumer = await new sourceMap.SourceMapConsumer(sourceMapContent)
    let result = consumer.originalPositionFor(findPos)

    console.log(result, 'xxx') // 返回是一个对象
    /**
     {
  "source": "webpack:///react-app.js",
  "line": 10,  // 业务代码中的行信息
  "column": 4,  // 业务代码中的列信息
  "name": "vue",
  // 这个是处理后的， 下面的代码处理后的
  "sourcesContentMap": {
    "0": "import React, { Component } from 'react'",
    "1": "import ReactDOM from 'react-dom'",
    "2": "",
    "3": "let AppComponent = class extends Component {",
    "4": "  constructor(props) {",
    "5": "    super(props)",
    "6": "  }",
    "7": "",
    "8": "  componentDidMount() {",
    "9": "    vue = 'vanilla' + 'react'",
    "10": "  }",
    "11": "",
    "12": "  render() {",
    "13": "    return <div>react app</div>",
    "14": "  }",
    "15": "}",
    "16": "",
    "17": "ReactDOM.render(<AppComponent />, document.querySelector('.react-area'))",
    "18": "",
    "19": "",
    "20": "",
    "21": "// WEBPACK FOOTER //",
    "22": "// ./react-app.js"
  }
}
     */
    // source line column name

    // 错误的源文件
    let originSource = sourcesPathMap[result.source]

    let sourcesContent = fileObj.sourcesContent[sources.indexOf(originSource)]
    let sourcesContentArr = sourcesContent.split('\n')
    let sourcesContentMap = {}

    sourcesContentArr.forEach((item, index) => {
      sourcesContentMap[index] = item
    })

    result.sourcesContentMap = sourcesContentMap

    ctx.body = result
  }

  return next()
}
