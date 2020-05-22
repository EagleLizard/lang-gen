
const parseLang = require('./lang/parse-lang');

const DATA_PATH = `${__dirname}/data`;
const TAO_FILE_PATH = `${DATA_PATH}/THE_TAO_TEH_KING.txt`;
const ART_OF_WAR_FILE_PATH = `${DATA_PATH}/art_of_war.txt`;
const PRINCE_FILE_PATH = `${DATA_PATH}/the_prince_machiavelli.txt`;
const KAMA_SUTRA_FILE_PATH = `${DATA_PATH}/KAMA_SUTRA.txt`;
const KING_JAMES_BIBLE_FILE_PATH = `${DATA_PATH}/king_james_bible.txt`;
const BOOK_OF_MORMON_FILE_PATH = `${DATA_PATH}/book_of_mormon.txt`;
const US_CONSTITUTION_FILE_PATH = `${DATA_PATH}/us_constitution.txt`;
const MANIFESTO_FILE_PATH = `${DATA_PATH}/manifesto.txt`;

const PARAGRAPH_MAX = 5;

(async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
  }
})();

async function main() {
  let dataFilePath, parsedData, langGraph;
  let langProducer;
  let searchResult;
  dataFilePath = TAO_FILE_PATH;
  parsedData = (
    await Promise.all(
      [
        // KAMA_SUTRA_FILE_PATH,
        // PRINCE_FILE_PATH,
        // TAO_FILE_PATH,
        // ART_OF_WAR_FILE_PATH,
        // BOOK_OF_MORMON_FILE_PATH,
        // KING_JAMES_BIBLE_FILE_PATH,
        US_CONSTITUTION_FILE_PATH,
        // MANIFESTO_FILE_PATH,
      ].map(parseLang.parseFile)
    )
  ).reduce((acc, curr) => {
    for(let i = 0; i < curr.length; ++i) {
      acc.push(curr[i]);
    }
    return acc;
  }, []);
  langGraph = await parseLang.analyze(parsedData, dataFilePath);
  langProducer = langGraph.getProducer();
  // testLangProducer(langProducer, 10);
  // generateLang(langProducer, 3);
  foreverLang(langProducer, 10, 15);
  // foreverLangFast(langProducer);
}

function testLangProducer(langProducer, numWords) {
  let currNode, words;
  words = [];
  for(let i = 0; i < numWords; ++i) {
    currNode = langProducer.next().value;
    words.push(currNode.value);
  }
  console.log(words);
}

function foreverLangFast(langProducer) {
  let sentenceCounter;
  let word, insertNewline, isPunctuation;
  sentenceCounter = 0;
  process.stdout.write('\n\t');
  while(sentenceCounter !== undefined) {
    word = langProducer.next().value.value;
    isPunctuation = isWordPunctuation(word);
    if(isWordSentenceEnd(word) && (sentenceCounter < PARAGRAPH_MAX)) {
      sentenceCounter++;
    }
    if(sentenceCounter >= PARAGRAPH_MAX) {
      insertNewline = true;
      sentenceCounter = 0;
    }
    if(!isPunctuation) {
      process.stdout.write(` ${word}`);
    }
    if(insertNewline === true) {
      insertNewline = false;
      process.stdout.write('\n\t\t');
    }
  }
}

function foreverLang(langProducer, wordMs, charMs) {
  let sentenceCounter;
  sentenceCounter = 0;
  process.stdout.write('\n\t');
  produceWord();
  async function produceWord() {
    let word, insertNewline, isPunctuation;
    word = langProducer.next().value.value;
    isPunctuation = isWordPunctuation(word);
    if(isWordSentenceEnd(word) && (sentenceCounter < PARAGRAPH_MAX)) {
      sentenceCounter++;
    }
    if(sentenceCounter >= PARAGRAPH_MAX) {
      insertNewline = true;
      sentenceCounter = 0;
    }
    if(!isPunctuation) {
      process.stdout.write(' ');
    }
    for(let i = 0; i < word.length; ++i) {
      await sleep(charMs);
      process.stdout.write(word[i]);
    }
    if(insertNewline === true) {
      process.stdout.write('\n\t');
    }
    setTimeout(() => {
      produceWord();
    }, wordMs);
  }
}

function isWordPunctuation(word) {
  return (word === '.')
    || (word === ',')
    || (word === ':')
    || (word === ';')
    || (word === '-')
    || (word === '!')
    || (word === '?')
    || (word === '\'');
}

function isWordSentenceEnd(word) {
  return (word === '.')
    || (word === '!')
    || (word === '?');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateLang(langProducer, len) {
  let words, currNode;
  words = [];
  for(let i = 0; i < len; ++i) {
    currNode = langProducer.next().value;
    words.push(currNode.value);
  }
  console.log(words.join(' '));
}
