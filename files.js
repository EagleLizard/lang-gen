
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const fStat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

module.exports = {
  mkdirIfNotExists,
  readFile,
  writeFile,
  getTimestamp
};

async function mkdirIfNotExists(dirPath) {
  let dirStat;
  dirPath = path.resolve(dirPath);
  try {
    dirStat = await fStat(dirPath);
  } catch(e) {
    // continue
  }
  if(dirStat && dirStat.isDirectory()) {
    return;
  }
  await mkdir(dirPath, { recursive: true });
}

function getTimestamp() {
  let date, datePart, timePart;
  date = new Date;
  datePart = date.toLocaleDateString().replace(/\//g, '-');
  timePart = date.toLocaleTimeString().split(' ').join('');
  return `${datePart}_${timePart}_${date.getMilliseconds()}`;
}
