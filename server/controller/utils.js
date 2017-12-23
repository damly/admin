/**
 * Created by damly on 2017/7/20.
 */
var mime = require('mime')
var code = require('../api').ApiCode
var User = require('../model/').User

var utils = {

  createToken: function (obj, timeout) {
    var obj2 = {
      data: obj,
      created: parseInt(Date.now() / 1000),
      exp: parseInt(timeout) || 10
    }

    var base64Str = Buffer.from(JSON.stringify(obj2), 'utf8').toString('base64')
    return base64Str
  },

  decodeToken: function (token) {
    var payload = {}
    try {
      payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'))
    } catch (e) {
      return false
    }

    return {
      payload: payload
    }
  },

  response: function (res, code, data) {
    let message = {
      code: code,
      data: data
    }
    res.json(message)
  },

  getCookie: function (cookie, name) {
    let arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
    if ((arr = cookie.match(reg))) { return arr[2] } else { return '' }
  },

  getToken: function (req) {
    let token = typeof (req.headers.token) === 'undefined' ? '' : req.headers.token

    token = token === '' ? (typeof (req.query.token) === 'undefined' ? '' : req.query.token) : token
    token = token === '' ? (typeof (req.body.token) === 'undefined' ? '' : req.body.token) : token

    if (token === '' && req.headers.cookie) {
      token = this.getCookie(req.headers.cookie, 'x-token')
    }
    return token
  },
  getMime: function (name, mimetype) {
    let array = name.split('.').slice(1)
    if (array.length === 0) {
      let str = ''
      return (str = mime.getExtension(mimetype)) ? ('.' + str) : ''
    } else {
      return '.' + array.join('.')
    }
  },
  check: function (req, res, success) {
    let token = utils.getToken(req)
    if (token) {
      let login = utils.decodeToken(token).payload.data
      User.findOne({login: login}, (err, doc) => {
        if (err) {
          utils.response(res, code.error, err)
        } else {
          console.log('check:', doc)
          if (doc) success(doc)
          else utils.response(res, code.error, '用户不存在!')
        }
      })
    } else {
      utils.response(res, code.error, '无效的token!')
    }
  }
}

module.exports = utils
