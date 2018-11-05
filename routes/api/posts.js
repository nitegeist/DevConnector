const express = require('express')
const router = express.Router()
const passport = require('passport')
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const validatePostInput = require('../../validation/post')

router.get('/test', (req, res) => {
  res.json({
    message: 'Posts works'
  })
})

router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ message: 'No posts found' }))
})

router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ message: 'No posts found with that ID' })
    )
})

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { text, name, avatar } = req.body
    const { errors, isValid } = validatePostInput(req.body)

    if (!isValid) {
      return res.status(400).json(errors)
    }
    const newPost = new Post({
      text,
      name,
      avatar,
      user: req.user.id
    })
    newPost.save().then(post => res.json(post))
  }
)

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: 'User not authorized' })
          }
          post
            .remove()
            .then(() => res.json({ message: 'Successfully deleted post' }))
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }))
    })
  }
)

router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ postnotfound: 'No post found' })
    }
    const index = post.likes.findIndex(like => {
      return like.user === req.user.id
    })
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res
        .status(400)
        .json({ alreadyliked: 'User already liked this post' })
    }
    console.log(index)
    if (index === -1) {
      post.likes.unshift({ user: req.user.id })
    }
    post = await post.save()
    res.json(post)
  }
)

router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ postnotfound: 'No post found' })
    }
    const index = post.likes.findIndex(like => {
      return like.user === req.user.id
    })
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res
        .status(400)
        .json({ notliked: 'You have not yet liked this post' })
    }
    console.log(index)
    if (index === -1) {
      post.likes.splice(index, 1)
    }
    post = await post.save()
    res.json(post)
  }
)

router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body)

    if (!isValid) {
      return res.status(400).json(errors)
    }
    const { text, name, avatar } = req.body
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text,
          name,
          avatar,
          user: req.user.id
        }
        post.comments.unshift(newComment)
        post.save().then(post => res.json(post))
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }))
  }
)

router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotfound: 'Comment does not exist' })
        }
        const index = post.comments.findIndex(comment => {
          return comment.user === req.user.id
        })
        console.log(index)
        if (index === -1) {
          post.comments.splice(index, 1)
        }
        post.save().then(post => res.json(post))
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }))
  }
)
module.exports = router
