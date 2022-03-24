const teacher = require('../models/teacher.model')

async function rootGetRequestHandler(req, res) {
  let user = req.session.get('user')
  
  if(!user) {
    res.redirect('/login')
  } else {
    if(user.type == 'Principal') {
      res.view('principal.ejs', { user })
    } else {
      res.view('basic-table.ejs', { user })
    }
  }
}

async function loginGetRequestHandler(req, res) {
  let user = req.session.get('user')

  if(user) {
    res.redirect('/')
  } else {
    res.view('login.ejs', { error: '' })
  }
}

async function registerGetRequestHandler(req, res) {
  let user = req.session.get('user')

  if(user) {
    res.redirect('/')
  } else {
    res.view('register.ejs', { error: '' })
  }
}

async function registerPostRequestHandler(req, res) {
  let data = JSON.parse(JSON.stringify(req.body))

  await teacher.getUser(data.email).then(async(user) => {
    if(user) {
      res.view('register.ejs', { error: `Account already exists with that email.` })
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
  });
}