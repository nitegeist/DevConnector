const express = require('express')
const router = express.Router()
const passport = require('passport')
const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')

const Profile = require('../../models/Profile')
const User = require('../../models/User')

router.get('/test', (req, res) => {
  res.json({
    message: 'Profile works'
  })
})

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {}
    Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])
      .then(profile => {
        if (!profile) {
          errors.noprofile = 'There is no profile for this user'
          return res.status(404).json(errors)
        }
        res.json(profile)
      })
      .catch(err => res.status(404).json(err))
  }
)

router.get('/all', (req, res) => {
  const errors = {}
  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = 'There are no profiles'
        return res.status(404).json(errors)
      }
      res.json(profiles)
    })
    .catch(err => res.status(404).json({ profile: 'There are no profiles' }))
})

router.get('/handle/:handle', (req, res) => {
  const errors = {}
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user'
        res.status(404).json(errors)
      }
      res.json(profile)
    })
    .catch(err =>
      res.status(404).json({ profile: 'There is no profile for this user' })
    )
})

router.get('/user/:user_id', (req, res) => {
  const errors = {}
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user'
        res.status(404).json(errors)
      }
      res.json(profile)
    })
    .catch(err =>
      res.status(404).json({ profile: 'There is no profile for this user' })
    )
})

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body)

    if (!isValid) {
      return res.status(400).json(errors)
    }

    const { skills, youtube, twitter, facebook, linkedin, instagram } = req.body
    const profileFields = {
      ...req.body,
      user: req.user.id,
      skills: skills.split(','),
      social: { youtube, twitter, facebook, linkedin, instagram }
    }

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          ).then(profile => res.json(profile))
        } else {
          Profile.findOne({ handle: profileFields.handle }).then(profile => {
            if (profile) {
              errors.handle = 'That handle already exists'
              res.status(400).json(errors)
            }
            new Profile(profileFields).save().then(profile => res.json(profile))
          })
        }
      })
      .catch(err => res.status(400).json(err))
  }
)

router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body
    const { errors, isValid } = validateExperienceInput(req.body)

    if (!isValid) {
      return res.status(400).json(errors)
    }

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const newExp = {
          title,
          company,
          location,
          from,
          to,
          current,
          description
        }
        profile.experience.unshift(newExp)
        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => res.status(400).json(err))
      })
      .catch(err => res.status(400).json(err))
  }
)

router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body
    const { errors, isValid } = validateEducationInput(req.body)

    if (!isValid) {
      return res.status(400).json(errors)
    }

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const newEdu = {
          school,
          degree,
          fieldofstudy,
          from,
          to,
          current,
          description
        }
        profile.education.unshift(newEdu)
        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => res.status(400).json(err))
      })
      .catch(err => res.status(400).json(err))
  }
)

router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        profile.experience.remove({ _id: req.params.exp_id })
        profile.save().then(profile => res.json(profile))
      })
      .catch(err => res.status(404).json(err))
  }
)

router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        profile.education.remove({ _id: req.params.edu_id })
        profile.save().then(profile => res.json(profile))
      })
      .catch(err => res.status(404).json(err))
  }
)

router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findOneAndRemove({ _id: req.user.id }).then(() =>
          res.json({ message: 'Successfully deleted user' })
        )
      })
      .catch(err => res.status(404).json(err))
  }
)

module.exports = router
