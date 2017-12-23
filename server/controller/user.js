var uri = require('../api').ApiUser
var code = require('../api').ApiCode
var User = require('../model/').User
var utils = require('./utils')

User.findOne({login: '13570870407'}, (err, doc) => {
  if (!doc) {
    var admin = new User({
      login: 'admin',
      password: '123456',
      nickname: '',
      token: '',
      type: 1
    })
    admin.save()
  }
})

module.exports = function (apiRouter) {
  apiRouter.post(uri.login, function (req, res) {
    let username = typeof (req.body.username) === 'undefined' ? '' : req.body.username
    let password = typeof (req.body.password) === 'undefined' ? '' : req.body.password

    console.log(uri.login, username, password)

    User.findOne({login: username, password: password}, (err, doc) => {
      if (doc) {
        doc.token = utils.createToken(doc.login, 100000)

        User.update({login: doc.login}, {token: doc.token}, (error) => {
          if (error) {
            utils.response(res, code.error, error)
          } else {
            utils.response(res, code.success, doc)
          }
        })
      } else {
        utils.response(res, code.error, err)
      }
    })
  })

  apiRouter.post(uri.logout, function (req, res) {
    utils.check(req, res, (user) => {
      User.update({login: user.login}, {token: ''}, (error) => {
        if (error) {
          utils.response(res, code.error, error)
        } else {
          utils.response(res, code.success, '')
        }
      })
    })
  })

  apiRouter.post(uri.add, function (req, res) {
    let nickname = typeof (req.body.nickname) === 'undefined' ? '' : req.body.nickname
    let login = typeof (req.body.username) === 'undefined' ? '' : req.body.username
    let password = typeof (req.body.password) === 'undefined' ? '123456' : req.body.password

    utils.check(req, res, (user) => {
      if (user.type === 1) {
        let user = new User({
          login: login,
          password: password,
          nickname: nickname,
          token: '',
          type: 0
        })
        user.save((error) => {
          if (error) {
            utils.response(res, code.error, error)
          } else {
            utils.response(res, code.success, '添加成员 ' + nickname + ' 成功!')
          }
        })
      }
    })
  })

  apiRouter.post(uri.list, function (req, res) {
    utils.check(req, res, (user) => {
      if (user.type) {
        User.find({}, {nickname: 1, login: 1}, (err, item) => {
          if (err) {
            utils.response(res, code.error, err)
          } else {
            utils.response(res, code.success, item)
          }
        })
      }
    })
  })
}
