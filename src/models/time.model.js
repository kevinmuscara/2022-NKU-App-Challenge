const times = require('./database/times.json')
const filename = require('path').join(__dirname, '/database/times.json')
const helper = require('../helpers')

function getTimes() {
  return new Promise(async(resolve, reject) => {
    if(times.length <= 0) {
      reject({
        status: 202,
        message: 'TIMES_LENGTH_EMPTY'
      });
    }

    resolve(times);
  });
}

function getTime(id) {
  return new Promise(async(resolve, reject) => {
    helper.isInArray(times, id).then(time => {
      resolve(time)
    }).catch(err => reject(err))
  })
}

function createTime(newTime, ID) {
  return new Promise(async(resolve, reject) => {
    const id = { ID };
    newTime = { ...id, ...newTime };
    
    times.push(newTime);
    helper.writeJSON(filename, times);

    resolve(newTime);
  });
}

function updateTime(id, newTime) {
  return new Promise(async(resolve, reject) => {
    helper.isInArray(times, id).then(time => {
      let index = times.findIndex(t => t.id == time.id);

      id = { id: time.id };
      times[index] = { ...id, ...newTime };

      helper.writeJSON(filename, times);
      resolve(times[index]);
    }).catch(err => reject(err));
  });
}

function deleteTime(id) {
  return new Promise(async(resolve, reject) => {
    helper.isInArray(times, id).then(() => {
      times = times.filter(t => t.id !== id);
      helper.writeJSON(filename, times);

      resolve();
    }).catch(err => reject(err));
  });
}

module.exports = { deleteTime, updateTime, createTime, getTime, getTimes }