
const LangNode = require('./lang-node');

module.exports = class LangGraph {
  constructor(name) {
    this.name = name;
    this.langNodes = new Map;
    this.lastAdded = null;
  }

  add(word) {
    let foundNode;
    if(!this.hasWord(word)) {
      this.langNodes.set(word, new LangNode(word));
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
    return this.langNodes.get(word);
  }

  hasWord(word) {
    return this.langNodes.has(word);
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
    let self, idx, currNode, lastNode, langNodes;
    self = this;
    langNodes = [ ...self.langNodes.values() ];
    if(seed === undefined) {
      // pick one at random
      idx = Math.floor(Math.random() * [ ...self.langNodes ].length);
    } else {
      idx = langNodes.findIndex(langNode => langNode.value === seed);
    }
    currNode = langNodes[idx];
    return langProducer();

    function* langProducer(stop) {
      let chanceMap, chanceTuples, mergedChanceMap, randIdx;
      while(!stop) {
        yield currNode;
        if(lastNode !== undefined) {
          chanceMap = mergeChanceMap(lastNode, currNode);
        } else {
          chanceMap = currNode.getChanceMap();
        }
        chanceTuples = [ ...chanceMap ];
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

    function mergeChanceMap(prevNode, currNode) {
      let prevRefNodes, currRefs, mergedChanceMap, prevRefs,
        prevRefCounts, prevRefCountTotal, prevRefChanceMap;
      /*
        1. Get all refs from the previous node
        3. Find all previous node refs that could lead to the current node refs
        2. Find all refs from the current node
       */
      currRefs = currNode.refs;
      prevRefs = [];
      prevRefNodes = prevNode.refs.reduce((acc, curr) => {
        let prevRefNode;
        prevRefNode = self.get(curr);
        if(!acc.includes(prevRefNode) && prevRefNode.hasSharedRefs(currNode.refs)) {
          prevRefNode.refs.forEach(ref => {
            if(ref !== currNode.value) {
              prevRefs.push(ref);
            }
          });
          acc.push(prevRefNode);
        }
        return acc;
      }, []);
      prevRefCounts = prevRefs.reduce((acc, curr) => {
        if(!acc.has(curr)) {
          acc.set(curr, 0);
        }
        acc.set(curr, acc.get(curr) + 1);
        return acc;
      }, new Map);
      prevRefCountTotal = [ ...prevRefCounts ].reduce((acc, curr) => {
        return acc + curr[1];
      }, 0);
      prevRefChanceMap = [ ...prevRefCounts ].reduce((acc, curr) => {
        acc.set(curr[0], curr[1] / prevRefCountTotal);
        return acc;
      }, new Map);
      mergedChanceMap = [ ...currNode.getChanceMap() ].reduce((acc, curr) => {
        let ref, currChance;
        ref = curr[0];
        currChance = curr[1];
        if(prevRefs.includes(ref)) {
          currChance = currChance + prevRefChanceMap.get(ref);
        }
        acc.set(ref, currChance);
        return acc;
      }, new Map);
      return mergedChanceMap;
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
