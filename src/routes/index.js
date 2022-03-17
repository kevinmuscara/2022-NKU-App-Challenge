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
    url: '/index',
    handler: async(req, res) => {
      const user = req.session.get('user')
      if(user) {
        res.view('index.ejs', {user})
      } else {
        res.redirect('/login')
      }
    }
  },
  {
    method: 'GET',
    url: '/logout',
    handler: async(req, res) => {
      req.session.delete()
      res.redirect('/')
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
    method: 'GET',
    url: '/students',
    handler: async(req, res) => {
      const user = req.session.get('user')
      if(user) {
        res.view('students.ejs', {user})
      } else {
        res.view('login.ejs', { error: '' })
      }
    }
  },
  {
    method: 'POST',
    url: '/register',
    handler: async(req, res) => {
      let data = JSON.parse(JSON.stringify(req.body))
      // Check if account already exists
      await teacher.getUser(data.email).catch(async(err) => {
        if(err.status === 500) {
          let newUser = {
            id: data.email,
            email: data.email,
            username: data.username,
            password: data.password,
            type: "Teacher"
          }

          await teacher.createUser(newUser, newUser.id).then(user => {
            req.session.set('user', user)
            res.redirect('/')
          })
        } else {
          res.view('register.ejs', { error: 'Account already exists with that email.'})
        }
      });
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
        } else {
          res.view('login.ejs', { error: `Invalid email or password.`})
        }
      }).catch(err => {
        if(err) res.view('login.ejs', {error:`Couldn't find an account with that email.`})
      })
    }
  }
];

module.exports = routes