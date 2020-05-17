
module.exports = class LangNode {
  constructor(value) {
    this.value = value;
    this.refCounts = new Map;
    this.refs = [];
  }

  addWord(langNode) {
    let word;
    word = langNode.value;
    if(!this.refCounts.has(word)) {
      this.refs.push(langNode);
      this.refCounts.set(word, 0);
    }
    this.refCounts.set(word, this.refCounts.get(word) + 1);
  }

  getChanceMap() {
    let refCountTuples, refTotal, chanceMap;
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
    return chanceMap;
  }
};
