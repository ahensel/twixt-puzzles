class QuarterBoard {
  constructor() {
    this.size = 12;

    this.board = [];
    for (let i = 1; i <= this.size; i++) {
      this.board[i] = [];
    }
  }

  isLegalSpot(x, y, color) {
    return (
      (color === 1 && x > 1 && x <= this.size && y >= 1 && y <= this.size) ||
      (color === 0 && x >= 1 && x <= this.size && y > 1 && y <= this.size)
    );
  }

  setPeg(peg) {
    if (!this.board[peg.x][peg.y]) {
      this.board[peg.x][peg.y] = peg;
    }
  }

  getPeg(x, y) {
    if (x < 1 || x > this.size || y < 1 || y > this.size) return null;
    if (!this.board[x]) return null;
    return this.board[x][y];
  }
}
