const express = require('express')
const path = require('path')
const basicAuth = require('express-basic-auth')
const app = express()
const port = process.env.PORT || 3000
require('dotenv').config()

app.use('/static', express.static(path.join(__dirname, 'static')))
app.use('/scripts', express.static(path.join(__dirname, '../node_modules')))
app.use('/contracts', express.static(path.join(__dirname, '../build/contracts')))

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/app', (req, res) => {
  res.render('app')
})

app.get('/ido', (req, res) => {
  res.render('ido')
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
