var express = require('express')
var apiRouter = express.Router()

require('../controller/user')(apiRouter)

module.exports = apiRouter
