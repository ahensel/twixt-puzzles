class TwixtController {
  constructor() {
    this.board = new QuarterBoard();
    this.move = new Move();
    this.link_distances = [{x: 1, y: -2}, {x: 2, y: -1}, {x: 2, y: 1}, {x: 1, y: 2},
                           {x: -1, y: 2}, {x: -2, y: 1}, {x: -2, y: -1}, {x: -1, y: -2}
    ];
  }

  isLinkable(x, y) {
    const peg = this.board.getPeg(x, y);

    return !!peg && this.link_distances.some(d => !peg.hasLink(d.x, d.y) && this.canLink(x, y, x + d.x, y + d.y));
  }

  removeLink(link) {
    this.move.removeLink(link);
  }

  addLinksTo(peg, isNew) {
    this.link_distances.forEach(d => {
      this.link(peg.x, peg.y, peg.x + d.x, peg.y + d.y, isNew);
    });
  }

  link(x1, y1, x2, y2, isNew) {
    if (this.canLink(x1, y1, x2, y2)) {
      const peg1 = this.board.getPeg(x1, y1);
      const peg2 = this.board.getPeg(x2, y2);
      if (!peg1.hasLink(x2 - x1, y2 - y1)) {
        const link = new Link(peg1, peg2);
        if (!isNew) this.move.addLink(link); // new peg's links are implicit
      }
    }
  }

  canLink(x1, y1, x2, y2) {
    const peg1 = this.board.getPeg(x1, y1);
    const peg2 = this.board.getPeg(x2, y2);
    return (!!peg1 && !!peg2 && peg1.color === peg2.color && !this.crossesExistingLink(x1, y1, x2, y2));
  }

  crossesExistingLink(x1, y1, x2, y2) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        if (!(x === x1 && y === y1 || x === x2 && y === y2)) {
          if (this.crossesPegsLinks(x, y, x1, y1, x2, y2)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  crossesPegsLinks(x, y, x1, y1, x2, y2) {
    const peg = this.board.getPeg(x, y);

    return !!peg && this.link_distances.some(d => peg.hasLink(d.x, d.y) && this.doLinksCross(x1, y1, x2, y2, x, y, x + d.x, y + d.y));
  }

  doLinksCross(x1, y1, x2, y2, x3, y3, x4, y4) {
    const distX = Math.abs(x1 + x2 - x3 - x4);
    const distY = Math.abs(y1 + y2 - y3 - y4);

    return (distX + distY < 3 && (distX === distY || (y2 - y1) * (x2 - x1) * (y4 - y3) * (x4 - x3) < 0));
  }

  placePeg(x, y, color) {
    const peg = new Peg(color, x, y);
    this.board.setPeg(peg);
    this.move.setPeg(peg);
    return peg;
  }

  getLastMoveText() {
    return this.move.getText();
  }

  clear() {
    this.move = new Move();
  }
}
