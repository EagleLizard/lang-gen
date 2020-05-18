
const LangNode = require('./lang-node');

module.exports = class LangGraph {
  constructor(name) {
    this.name = name;
    this.langNodes = [];
    this.lastAdded = null;
  }

  add(word) {
    let foundNode;
    if(!this.hasWord(word)) {
      this.langNodes.push(new LangNode(word));
    }
    foundNode = this.get(word);
    if(this.lastAdded === null) {
      this.lastAdded = foundNode;
      return;
    }
    this.lastAdded.addWord(foundNode);
    this.lastAdded = foundNode;
  }

  get(word) {
    let foundIdx;
    foundIdx = this.findIndex(word);
    return (foundIdx !== -1)
      ? this.langNodes[foundIdx]
      : undefined;
  }

  hasWord(word) {
    return this.get(word) !== undefined;
  }

  breadthFirst(startWord, endWord) {
    let self, startNode, toVisit;
    self = this;
    startNode = self.get(startWord);
    toVisit = startNode.refs;
    return breadthFirstHelper(toVisit);
    function breadthFirstHelper(queue, soFar) {
      let nextQueue;
      if(soFar === undefined) soFar = 1;
      nextQueue = [];
      for(let i = 0, currNode; i < queue.length, currNode = queue[i]; ++i) {
        if(currNode.value === endWord) {
          return soFar;
        }
        nextQueue.push(...currNode.refs);
      }
      return breadthFirstHelper(nextQueue, soFar + 1);
    }
  }

  getProducer(seed) {
    let self, idx, currNode, lastNode;
    self = this;
    if(seed === undefined) {
      // pick one at random
      idx = Math.floor(Math.random() * self.langNodes.length);
    } else {
      idx = self.findIndex(seed);
    }
    currNode = self.langNodes[idx];
    return langProducer();

    function* langProducer(stop) {
      let chanceTuples, randIdx;
      while(!stop) {
        yield currNode;
        chanceTuples = [ ...currNode.getChanceMap() ];
        chanceTuples.sort((a, b) => {
          if(a[1] < b[1]) return 1;
          if(a[1] > b[1]) return -1;
          return 0;
        });
        randIdx = randWeightedIdx(chanceTuples);
        lastNode = currNode;
        currNode = self.get(chanceTuples[randIdx][0]);
      }
    }
  }

  findIndex(word) {
    return this.langNodes.findIndex(langNode => {
      return langNode.value === word;
    });
  }
};

function randWeightedIdx(weightTuples) {
  let weightSum, rand, randIdx;
  weightSum = weightTuples.reduce((acc, curr) => {
    return acc + curr[1];
  }, 0);
  rand = Math.random() * weightSum;
  weightTuples.some((weightTuple, idx) => {
    if(rand < weightTuple[1]) {
      randIdx = idx;
      return true;
    }
    rand = rand - weightTuple[1];
  });
  return randIdx;
}
