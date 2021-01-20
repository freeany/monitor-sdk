let Koa = require('koa')
let Serve = require('koa-static')
const api = require('./middleware/api')

const sourcemap = require('./middleware/sourcemap')

const app = new Koa()

app.use(api)
app.use(sourcemap)
app.use(Serve(__dirname + '/client'))

app.listen(3000, () => {
  console.log('http://localhost:3000')
})
