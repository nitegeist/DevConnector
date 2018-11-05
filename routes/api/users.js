const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')

const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

router.get('/test', (req, res) => {
  res.json({
    message: 'Users works'
  })
})

router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body)
  const { name, email, password } = req.body

  if (!isValid) {
    return res.status(400).json(errors)
  }

  User.findOne({ email }).then(user => {
    if (user) {
      errors.email = 'Email already exists'
      return res.status(400).json(errors)
    } else {
      const newAvatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      })
      const newUser = new User({
        name: name,
        email: email,
        password: password,
        avatar: newAvatar
      })

      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err
          newUser.password = hash
          newUser
            .save()
            .then(user => res.json(user))
            .catch(console.log(err))
        })
      })
    }
  })
})

router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body)
  const { email, password } = req.body

  if (!isValid) {
    return res.status(400).json(errors)
  }

  User.findOne({ email })
    .then(user => {
      if (!user) {
        errors.email = 'User not found'
        return res.status(404).json(errors)
      }

      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          const payload = { id: user.id, name: user.name, avatar: user.avatar }
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              if (err) {
                console.log(err)
              } else {
                res.json({
                  success: true,
                  token: 'Bearer ' + token
                })
              }
            }
          )
        } else {
          errors.password = 'Password incorrect'
          return res.status(400).json(errors)
        }
      })
    })
    .catch(err => console.log(err))
})

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { id, name, email } = req.user
    res.json({
      id,
      name,
      email
    })
  }
)

module.exports = router
