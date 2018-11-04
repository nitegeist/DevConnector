const express = require('express')
const mongoose = require('mongoose')

const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')

const app = express()

// DB COnfig
const db = require('./config/keys').mongoURI

// connect to mongodb
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('Database Connected'))
  .catch(err => console.log(err))
mongoose.set('debug', true)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// use routes
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`)
})

// Run app, then load http://localhost:port in a browser to see the output.
