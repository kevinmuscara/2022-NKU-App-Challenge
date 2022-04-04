const users = require('./database/users.json')
const filename = require('path').join(__dirname, '/database/users.json')
const helper = require('../helpers')

function getUsers() {
  return new Promise(async(resolve, reject) => {
    if(users.length <= 0) {
      reject({
        status: 202,
        message: 'USER_LENGTH_LESS_THAN_OR_EQUAL_TO_ZERO'
      });
    }

    resolve(users);
  })
}

function getUser(id) {
  return new Promise(async(resolve, reject) => {
    helper.isInArray(users, id).then(user => {
      resolve(user)
    }).catch(err => reject(err))
  });
}

function createUser(newUser, ID) {
  return new Promise(async(resolve, reject) => {
    const id = { ID };
    newUser = { ...id, ...newUser, status: false };
    
    users.push(newUser);
    helper.writeJSON(filename, users);
    
    resolve(newUser)
  })
}

function updateUser(id, newUser) {
  return new Promise(async(resolve, reject) => {
    helper.isInArray(users, id).then(user => {
      let index = users.findIndex(u => u.id == user.id);

      id = { id: user.id };
      users[index] = { ...id, ...newUser };
      
      helper.writeJSON(filename, users);
      resolve(users[index]);
    }).catch(err => reject(err));
  });
}

function deleteUser(id) {
  return new Promise(async(resolve, reject) => {
    helper.isInArray(users, id).then(() => {
      users = users.filter(u => u.id !== id);
      helper.writeJSON(filename, users);

      resolve();
    }).catch(err => reject(err));
  });
}

module.exports = { deleteUser, updateUser, createUser, getUser, getUsers }