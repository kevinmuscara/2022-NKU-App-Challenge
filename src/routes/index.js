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
        if(user.type == 'Principal') {
          res.view('principal.ejs', {user })
        } else {
          time.getTimes().then(async(times) => {
            res.view('basic-table.ejs', { user, times })
          }).catch(async(err) => {
            if(err.status === 202) {
              res.view('basic-table.ejs', { user, times: [] })
            }
          })
        }
      }
    }
  },
  {
    method: 'GET',
    url: '/scan/:id',
    handler: async(req, res) => {
      const user = req.session.get('user')
      if(!user) {
        res.redirect('/login')
      } else {
        let { id } = req.params
        await teacher.getUser(id).then(async(student) => {
          await time.getTimes().then(async(studentTimes) => {
            let realStudents = []
            studentTimes.forEach(studentTime => {
              if(studentTime.id == student.id) {
                realStudents.push(studentTime);
              }
            });

            if(realStudents[realStudents.length - 1].status === true) {
              // set to false
              await time.createTime({ ...realStudents[realStudents.length - 1], time: Date().toString(), status: false }).then((newStudent => res.redirect('/')));
            } else {
              // set to true
              await time.createTime({ ...realStudents[realStudents.length - 1], time: Date().toString(), status: true }).then((newStudent => res.redirect('/')));
            }
          }).catch(async(err) => {
            if(err.status === 202) {
              await time.createTime({ ...student, time: Date().toString(), status: false }).then((newStudent) => res.redirect('/'))
            }
          })
        }).catch(async(err) => {
          if(err.status === 500) {}
        })
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
        let allStudents = await teacher.getUsers()
        let students = []
        
        for(var i = 0; i < allStudents.length; i++) {
          if(allStudents[i].type == "Student") {
            if(user.type == "Principal") {
              students.push(allStudents[i])
            } else {
              if(allStudents[i].teacher == user.id) {
                students.push(allStudents[i])
              }
            }
          }
        }

        res.view('students.ejs', {error: '', user, students })
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
        await teacher.getUser(data.nfcTag).catch(async(acc) => {
          if(acc) {
            let allStudents = await teacher.getUsers()
            let students = []
            
            for(var i = 0; i < allStudents.length; i++) {
              if(allStudents[i].type == "Student") {
                if(user.type == "Principal") {
                  students.push(allStudents[i])
                } else {
                  if(allStudents[i].teacher == user.id) {
                    students.push(allStudents[i])
                  }
                }
              }
            }
    
            if(acc.status === 500) {
              let newStudent = {
                id: data.nfcTag,
                firstName: data.firstName,
                lastName: data.lastName,
                teacher: user.id,
                type: "Student"
              }
  
              await teacher.createUser(newStudent, newStudent.id).then(async() => {
                res.view('students.ejs', { error: '', user, students })
              });
            } else {
              res.view('students.ejs', { students, error: 'A student with that ID already exists.', user })
            }
          }
        }).catch(async(err) => {
          if(err.status === 500) {
            let allStudents = await teacher.getUsers()
            let students = []
            
            for(var i = 0; i < allStudents.length; i++) {
              if(allStudents[i].type == "Student") {
                if(user.type == "Principal") {
                  students.push(allStudents[i])
                } else {
                  if(allStudents[i].teacher == user.id) {
                    students.push(allStudents[i])
                  }
                }
              }
            }

            let newStudent = {
              id: data.nfcTag,
              firstName: data.firstName,
              lastName: data.lastName,
              type: "Student"
            }

            await teacher.createUser(newStudent, newStudent.id).then(() => {
              res.view('students.ejs', { error: '', user, students, })
            });
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