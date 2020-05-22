
module.exports = class LangNode {
  constructor(value) {
    this.value = value;
    this.refCounts = new Map;
    this.refs = [];
    this.chanceMap = null;
  }

  addWord(langNode) {
    let word;
    word = langNode.value;
    if(!this.refCounts.has(word)) {
      this.refs.push(word);
      this.refCounts.set(word, 0);
    }
    this.refCounts.set(word, this.refCounts.get(word) + 1);
  }

  hasSharedRefs(refs) {
    return this.refs.some(ref => {
      return refs.includes(ref);
    });
  }

  hasRef(langNode) {
    let value;
    value = ((typeof langNode) === 'string')
      ? langNode
      : langNode.value ;
    return this.refCounts.has(value);
  }

  getRef(langNode) {
    let foundIdx;
    foundIdx = this.refs.findIndex(ref => {
      return ref.value === langNode.value;
    });
    if(foundIdx === -1) {
      return undefined;
    }
    return this.refs[foundIdx];
  }

  getRefCountSum() {
    return this.refs.reduce((acc, curr) => {
      acc = acc + this.refCounts.get(curr);
      return acc;
    }, 0);
  }

  getChanceMap() {
    let refCountTuples, refTotal, chanceMap;
    if(this.chanceMap !== null) {
      return this.chanceMap;
    }
    refCountTuples = [ ...this.refCounts ];
    refTotal = refCountTuples.reduce((acc, curr) => {
      return acc + curr[1];
    }, 0);
    chanceMap = refCountTuples.reduce((acc, curr) => {
      let wordChance;
      wordChance = curr[1] / refTotal;
      acc.set(curr[0], wordChance);
      return acc;
    }, new Map);
    this.chanceMap = chanceMap;
    return chanceMap;
  }
};
