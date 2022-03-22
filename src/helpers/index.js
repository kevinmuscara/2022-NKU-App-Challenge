const { writeFileSync } = require('fs')
 
let createNewId = (array) => {
  if(array.length > 0) return array[array.length - 1].id + 1;
  else return 1;
}

function validateUser(user) {
  return new Promise(async(resolve, reject) => {
    const { id, email, username, password, type } = user;

    if(typeof id !== "string") reject({ status: 500, message: 'invalid id type'});
    else if(typeof email !== "string") reject({ status: 500, message: 'invalid email type'});
    else if(typeof username !== 'string') reject({ status: 500, message: 'invalid username type'});
    else if(typeof password !== 'string' || 'number') reject({ status: 500, message: 'invalid password type'});
    else resolve(user);
  });
}

function isInArray(array, id) {
  return new Promise(async(resolve, reject) => {
    let row = array.find(r => r.id == id);
    if(!row) {
      reject({status: 500})
    } else {
      resolve(row)
    }
  })
}

function writeJSON(filename, content) {
  return new Promise(async(resolve, reject) => {
    resolve(writeFileSync(filename, JSON.stringify(content), 'utf8', (err) => {
      if(err) reject(err)
    }))
  })
}

module.exports = { createNewId, isInArray, writeJSON, validateUser }