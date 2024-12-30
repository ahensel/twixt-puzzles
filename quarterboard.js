function QuarterBoard()
{
  this.size = 12
  
  this.board = new Array()
  for (var i=1; i <= this.size; i++) {
    this.board[i] = new Array()
  }
  
  this.isLegalSpot = function(x, y, color) {
    return ((color == 1 && x > 1 && x <=this.size && y >=1 && y <=this.size) ||
    (color == 0 && x >=1 && x <=this.size && y > 1 && y <=this.size))
  }
  
  this.setPeg = function(peg) {
    if (this.board[peg.x][peg.y] == null) {
      this.board[peg.x][peg.y] = peg
    }
  }
  
  this.getPeg = function(x, y) {
    if (x < 1 || x > this.size || y < 1 || y > this.size) return null
    if (this.board[x] == null) return null
    return this.board[x][y]
  }
}
