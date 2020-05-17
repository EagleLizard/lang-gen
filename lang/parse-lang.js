
const path = require('path');

const files = require('../files');
const LangGraph = require('./lang-graph');

const OUT_PATH = `${__dirname}/../out`;
const PUNCT_WORDS = '/\\.,;:!?-'.split('');

module.exports = {
  parseFile,
  analyze,
};

function analyze(parsedData, filePath) {
  let parsedPath, wordMap, graphName, langGraph;
  parsedPath = path.parse(filePath);
  graphName = parsedPath.name;
  wordMap = parsedData.reduce((acc, curr) => {
    if(!acc.has(curr)) {
      acc.set(curr, 0);
    }
    acc.set(curr, acc.get(curr) + 1);
    return acc;
  }, new Map());
  // writeOutFileWithTimestamp(
  //   filePath,
  //   [ ...wordMap ].map(wordTuple => `${wordTuple[0]}: ${wordTuple[1]}\n`).join(''),
  //   `COUNT_${parsedPath.name}`
  // );
  // writeOutFile(filePath, [ ...wordMap ].map(wordTuple => `${wordTuple[0]}: ${wordTuple[1]}\n`).join(''));
  langGraph = new LangGraph(graphName);
  parsedData.forEach(word => {
    langGraph.add(word);
  });
  return langGraph;
}

async function parseFile(filePath) {
  let dataStr, words;
  dataStr = (await files.readFile(filePath)).toString();
  dataStr = scrubPunctuation(dataStr);
  await files.mkdirIfNotExists(OUT_PATH);
  words = parseWords(dataStr);
  // writeOutFile(filePath, words.join(' '));
  return words;
}

function scrubPunctuation(dataStr) {
  let punctRx;
  punctRx = /[()[\]"]/g;
  return dataStr.replace(punctRx, '');
}

/*
  A paragraph is an uninterrupted group of words and lines
*/
function parseWords(dataStr) {
  let rawLines, trimmedLines, rawWords, words;
  // scrub any carriage return chars
  dataStr = dataStr.replace(/\r/g, '');
  rawLines = dataStr.split('\n');
  trimmedLines = rawLines.map((line => line.trim())).filter(line => line.length > 0);
  rawWords = trimmedLines.reduce((acc, curr) => {
    let splatLine;
    splatLine = curr.split(' ');
    return [ ...acc, ...splatLine ];
  }, [])
    .map(word => word.trim())
    .filter(word => word.length > 0);
  words = rawWords.reduce((acc, curr) => {
    let words, punctWords, hasPunctWord, nonPunctStack;
    // we'll treat some punctuations as separate words for this use case
    words = [];
    hasPunctWord = PUNCT_WORDS.some(punctWord => curr.includes(punctWord));
    if(hasPunctWord) {
      nonPunctStack = [];
      curr.split('').forEach(char => {
        let foundPunctIdx;
        foundPunctIdx = PUNCT_WORDS.findIndex(punctWord => punctWord === char);
        if(foundPunctIdx === -1) {
          nonPunctStack.push(char);
        } else {
          if(nonPunctStack.length > 0) {
            words.push(nonPunctStack.join(''));
            nonPunctStack = [];
          }
          words.push(PUNCT_WORDS[foundPunctIdx]);
        }
      });
      if(nonPunctStack.length > 0) {
        words.push(nonPunctStack.join(''));
        nonPunctStack = [];
      }
    } else {
      words = [ curr ];
    }
    return [ ...acc, ...words ];
  }, []);
  return words;
}

function writeOutFile(filePath, data) {
  return writeOutFileWithTimestamp(filePath, data);
}

function writeOutFileWithTimestamp(filePath, data, newName, newExt) {
  let outPath, parsedPath, fileName, fileExt, timestamp;
  parsedPath = path.parse(filePath);
  fileName = newName || parsedPath.name;
  fileExt = newExt || parsedPath.ext;
  timestamp = files.getTimestamp();
  outPath = `${OUT_PATH}/${fileName}_${timestamp}.${fileExt}`;
  return files.writeFile(outPath, data);
}
