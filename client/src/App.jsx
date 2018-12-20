import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import jwtDecode from 'jwt-decode'
import setAuthHeader from './utils/setAuthHeader'
import { setCurrentUser, logoutUser } from './actions/authActions'
import { Provider } from 'react-redux'
import store from './store'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Landing from './components/layout/Landing'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Dashboard from './components/dashboard'
import './App.css'
import { clearCurrentProfile } from './actions/profileActions'

class App extends Component {
  componentDidMount () {
    if (window.localStorage) {
      // Check for token
      if (window.localStorage.jwToken) {
        const { jwtToken } = window.localStorage
        // Set auth token header
        setAuthHeader(jwtToken)
        // Decode token and get user info and exp
        const decoded = jwtDecode(jwtToken)
        // Set user and isAuthenticated
        store.dispatch(setCurrentUser(decoded))

        // Check for expired token
        const currentTime = Date.now() / 1000
        if (decoded.exp < currentTime) {
          // Logout User
          store.dispatch(logoutUser())

          // Clear current Profile
          store.dispatch(clearCurrentProfile())

          // Redirect to login
          window.location.href = '/login'
        }
      }
    }
  }
  render () {
    return (
      <Provider store={store}>
        <Router>
          <div className='App'>
            <Navbar />
            <Route exact path='/' component={Landing} />
            <div className='container'>
              <Route exact path='/register' component={Register} />
              <Route exact path='/login' component={Login} />
              <Route exact path='/dashboard' component={Dashboard} />
            </div>
            <Footer />
          </div>
        </Router>
      </Provider>
    )
  }
}

export default App
