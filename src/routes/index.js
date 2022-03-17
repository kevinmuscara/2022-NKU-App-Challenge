const teacher = require('../models/teacher.model')

let routes = [
  {
    method: 'GET',
    url: '/',
    handler: async(req, res) => {
      const user = req.session.get('user') // find user session
      if(!user) {
        res.redirect('/login') // prompt client to login if no user session found
      } else {
        res.view('basic-table.ejs', {user}) // if there's a user session, pass through.
      }
    }
  },
  {
    method: 'GET',
    url: '/login',
    handler: async(req, res) => {
      const user = req.session.get('user')
      if(user) {
        res.redirect('/')
      } else {
        res.view('login.ejs', {error: ''})
      }
    }
  },
  {
    method: 'GET',
    url: '/register',
    handler: async(req, res) => {
      const user = req.session.get('user')
      if(user) {
        res.redirect('/')
      } else {
        res.view('register.ejs', {error: ''})
      }
    }
  },
  {
    method: 'POST',
    url: '/register',
    handler: async(req, res) => {
      let data = JSON.parse(JSON.stringify(req.body))
      // Check if account already exists
      await teacher.getUser(data.email).then(async(user) => {
        if(user) {
          res.view('register.ejs', { error: 'Account already exists with that email.'})
        } else {
          let newUser = {
            id: data.email,
            email: data.email,
            username: data.username,
            password: data.password,
            type: "Teacher"
          }

          await teacher.createUser(newUser, newUser.id).then(createdUser => {
            req.session.set('user', createdUser) // set user session.
            res.redirect('/') // redirect back to root with user session created.
          })
        }
      })
    }
  },
  {
    method: 'POST',
    url: '/login',
    handler: async(req, res) => {
      let data = JSON.parse(JSON.stringify(req.body))
      // Find user by login ID
      await teacher.getUser(data.email).then(async(user) => {
        if(user.password == data.password) {
          req.session.set('user', user)
          res.redirect('/')
        }
      }).catch(err => {
        if(err) res.view('login.ejs', {error:'Invalid email or password'})
      })
    }
  }
];

module.exports = routes