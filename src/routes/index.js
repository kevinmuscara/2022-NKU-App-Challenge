const teacher = require('../models/teacher.model')
const time = require('../models/time.model')

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
    method: 'POST',
    url: '/checkout',
    handler: async(req, res) => {
      
    }
  },
  {
    method: 'POST',
    url: '/checkin',
    handler: async(req, res) => {

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
        res.view('students.ejs', {error: '', user})
      } else {
        res.view('login.ejs', { error: '' })
      }
    }
  },
  {
    method: 'POST',
    url: '/students',
    handler: async(req, res) => {
      const user = req.session.get('user')
      if(user) {
        let data = JSON.parse(JSON.stringify(req.body))

        await time.getTime(data.nfcTag).catch(async(err) => {
          if(err.status === 500) {
            // student doesn't already exist so continue
            let newStudent = {
              id: data.nfcTag,
              firstName: data.firstName,
              lastName: data.lastName,
              type: "Student"
            }

            await time.createTime(newStudent, newStudent.id).then(() => {
              res.view('students.ejs', { user, error: '' })
            })
          } else {
            res.view('students.ejs', { user, error: `A student with that tag is already onboarded.`})
          }
        })
      } else {
        res.redirect('/login')
      }
    }
  },
  {
    method: 'GET',
    url: '/principal',
    handler: async(req, res) => {
      const user = req.session.get('user')
      if(user) {
        if(user.type == 'Principal') {
          res.view('principal.ejs', { user })
        } else {
          res.redirect('/')
        }
      } else {
        res.redirect('/login')
      }
    }
  },
  {
    method: 'POST',
    url: '/register',
    handler: async(req, res) => {
      let data = JSON.parse(JSON.stringify(req.body))
      await teacher.getUser(data.email).then(async(user) => {
        if(user) {
          res.view('register.ejs', { error: 'Account already exists with that email.'})
        }
      }).catch(async(err) => {
        if(err.status === 500) {
          let newUser = {
            id: data.email,
            email: data.email,
            username: data.username,
            password: data.password,
            type: 'Teacher'
          }

          await teacher.createUser(newUser, newUser.id).then(user => {
            req.session.set('user', user)
            res.redirect('/')
          });
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