const { writeFileSync } = require('fs')
 
let createNewId = (array) => {
  if(array.length > 0) return array[array.length - 1].id + 1;
  else return 1;
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

module.exports = { createNewId, isInArray, writeJSON }