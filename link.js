class Link {
  constructor(peg1, peg2) {
    // Ensure pegs are ordered by y-coordinate
    if (peg1.y < peg2.y) {
      this.peg1 = peg1;
      this.peg2 = peg2;
    } else {
      this.peg1 = peg2;
      this.peg2 = peg1;
    }

    // Add links to both pegs
    peg1.addLink(this);
    peg2.addLink(this);
  }

  getLinkName() {
    return `_${this.peg1.x}_${this.peg1.y}_${this.peg2.x}_${this.peg2.y}`;
  }

  getNotation() {
    if (Math.abs(this.peg1.x - this.peg2.x) === 1) {
      return `${this.peg1.getXnotation(this.minX())}'${this.peg1.getYnotation((this.peg1.y + this.peg2.y) / 2)}`;
    } else {
      return `${this.peg1.getXnotation((this.peg1.x + this.peg2.x) / 2)}${this.peg1.getYnotation(this.minY())}'`;
    }
  }

  getRemoveNotation() {
    return `-${this.getNotation()}`;
  }

  getAddNotation() {
    return `${this.peg1.x < this.peg2.x ? "\\" : "/"}${this.getNotation()}`;
  }

  toString() {
    return this.getAddNotation();
  }

  linkIndex(p1, p2) {
    return p1.getLinkIndex(p2.x - p1.x, p2.y - p1.y);
  }

  getIndex(peg) {
    return peg === this.peg1 
      ? this.linkIndex(peg, this.peg2) 
      : this.linkIndex(peg, this.peg1);
  }

  remove() {
    this.peg1.removeLink(this);
    this.peg2.removeLink(this);
  }

  minX() {
    return Math.min(this.peg1.x, this.peg2.x);
  }

  maxX() {
    return Math.max(this.peg1.x, this.peg2.x);
  }

  minY() {
    return Math.min(this.peg1.y, this.peg2.y);
  }

  maxY() {
    return Math.max(this.peg1.y, this.peg2.y);
  }
}
