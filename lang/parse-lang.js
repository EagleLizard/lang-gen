
const path = require('path');

const files = require('../files');
const LangGraph = require('./lang-graph');

const OUT_PATH = `${__dirname}/../out`;
const PUNCT_WORDS = '/\\.,;:!?-'.split('');

module.exports = {
  parseFile,
  analyze,
};

async function analyze(parsedData, filePath) {
  let parsedPath, graphName, langGraph;
  let wordMap, wordTuples;
  let startMs, endMs;
  startMs = Date.now();
  parsedPath = path.parse(filePath);
  graphName = parsedPath.name;
  wordMap = parsedData.reduce((acc, curr) => {
    if(!acc.has(curr)) {
      acc.set(curr, 0);
    }
    acc.set(curr, acc.get(curr) + 1);
    return acc;
  }, new Map());
  wordTuples = [ ...wordMap ];
  wordTuples.sort((a, b) => {
    if(a[1] > b[1]) return -1;
    if(a[1] < b[1]) return 1;
    return 0;
  });
  // await writeOutFile(filePath, wordTuples.map(tuple => `${tuple[0]}: ${tuple[1]}\n`).join(''));
  langGraph = new LangGraph(graphName);
  parsedData.forEach(word => {
    langGraph.add(word);
  });
  endMs = Date.now();
  console.log(`Analyze: ${endMs - startMs}`);
  return langGraph;
}

async function parseFile(filePath) {
  let dataStr, words;
  console.log(`${path.parse(filePath).base}\n`);
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
  let startMs, endMs;
  // scrub any carriage return chars
  dataStr = dataStr.replace(/\r/g, '');
  rawLines = dataStr.split('\n');
  startMs = Date.now();
  trimmedLines = rawLines.map((line => line.trim())).filter(line => line.length > 0);
  rawWords = trimmedLines.reduce((acc, curr) => {
    let splatLine;
    splatLine = curr.split(' ');
    acc.push(...splatLine);
    return acc;
  }, [])
    .map(word => word.trim())
    .filter(word => word.length > 0);
  endMs = Date.now();
  console.log(`Trimming: ${endMs - startMs}ms`);
  startMs = Date.now();
  words = [];
  words = rawWords.reduce((acc, curr) => {
    let punctWords, hasPunctWord;
    // we'll treat some punctuations as separate words for this use case
    punctWords = [];
    hasPunctWord = PUNCT_WORDS.some(punctWord => curr.includes(punctWord));
    if(hasPunctWord) {
      punctWords = parsePuncWord(curr);
    } else {
      punctWords = [ curr ];
    }
    acc.push(...punctWords);
    return acc;
  }, []);
  endMs = Date.now();
  console.log(`Parsing words: ${endMs - startMs}ms`);
  return words;
}

function parsePuncWord(word) {
  let nonPunctStack, words, splatChars;
  nonPunctStack = [];
  words = [];
  splatChars = word.split('');
  for(let i = 0, char; i < splatChars.length, char = splatChars[i]; ++i) {
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
  }
  if(nonPunctStack.length > 0) {
    words.push(nonPunctStack.join(''));
    nonPunctStack = [];
  }
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
