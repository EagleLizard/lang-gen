
const parseLang = require('./lang/parse-lang');

const DATA_PATH = `${__dirname}/data`;
const TAO_FILE_PATH = `${DATA_PATH}/THE_TAO_TEH_KING.txt`;
const PRINCE_FILE_PATH = `${DATA_PATH}/the_prince_machiavelli.txt`;

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
  dataFilePath = PRINCE_FILE_PATH;
  parsedData = await parseLang.parseFile(dataFilePath);
  langGraph = parseLang.analyze(parsedData, dataFilePath);
  langProducer = langGraph.getProducer('The');
  generateLang(langProducer, 100);
}

function generateLang(langProducer, len) {
  let words, currNode;
  words = [];
  for(let i = 0; i < len; ++i) {
    currNode = langProducer.next().value;
    // console.log([ ...currNode.getChanceMap() ]);
    words.push(currNode.value);
  }
  console.log(words.join(' '));
}
