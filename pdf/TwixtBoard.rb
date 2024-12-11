require 'Move'
require 'Peg'

class TwixtBoard
  # public interface:
  # 
  # board = TwixtBoard.new(x,y)
  #  int     getWidth
  #  int     getHeight
  #  int     getColor(x,y)
  #          isValidSpot(x,y,color)
  #          play(move)
  #          setPeg(x,y,color)
  #          setPegAndLink(x,y,color)
  #          removePeg(x,y)
  #          swap
  #          isSwapped
  #          resign
  #          draw
  #          isDraw
  #          forfeit
  #          isForfeit
  #          setPlayer(num, name)
  #          getPlayerName(num)
  #          getNumCrossedLinks
  #          getNumCrossedLinksFor(player)
  #  boolean canLink(x1,y1, x2,y2)
  #  boolean isLinked(x1,y1, x2,y2)
  #          link(x1,y1, x2,y2)
  #          unlink(x1,y1, x2,y2)
  #  boolean hasWonColor(color)
  #  boolean hasWonPlayer(num)

  def initialize(x, y)
    @x = x
    @y = y
    @numPegs = 0
    @swapped = false
    @draw = false
    @moves = Array.new
    @board = Array.new(x).collect {|a| Array.new(y, nil)}
  end

  def getWidth
    return @x
  end

  def getHeight
    return @y
  end

  def isPegAt(x, y)
    return (x >= 0 and x < @x and y >= 0 and y < @y and
            @board[x][y] != nil)
  end

  def getNumPegs
    return @numPegs
  end

  def getColor(x,y)
    if isPegAt(x,y)
      peg = @board[x][y]
      return peg.getColor
    end
    return nil
  end

  def isValidSpot(x,y,color)
    return (((color == :red   and (x > 0 and x < (@x - 1))) or
             (color == :black and (y > 0 and y < (@y - 1)))) and
             @board[x][y] == nil)
  end

  def play(move)
    if move.getType == Move::Peg
      setPegAndLink(move.getX, move.getY, move.getPlayer)
    elsif move.getType == Move::Swap
      swap
    elsif move.getType == Move::Resign
      resign(move.getPlayer)
    elsif move.getType == Move::Forfeit
      forfeit(move.getPlayer)
    elsif move.getType == Move::Draw
      draw
    end
    @moves << move
  end

  def getMove(n)
    return @moves[n]
  end

  def setPeg(x,y,color)
    if isValidSpot(x,y,color)
      @board[x][y] = Peg.new(color)
      @numPegs += 1
    end
  end

  def setPegAndLink(x,y,color, &block)
    if isValidSpot(x,y,color)
      @board[x][y] = Peg.new(color)
      @numPegs += 1

      forEachKnightNeighbor {|dx, dy|
        link(x, y, x + dx, y + dy, &block)
      }
    end
  end

  def removePeg(x,y)
    forEachKnightNeighbor {|dx, dy|
      unlink(x, y, x + dx, y + dy)
    }
    @board[x][y] = nil
    @numPegs -= 1
  end

  def swap
    @swapped = true
  end

  def resign(color)
    @resignation = color
  end

  def forfeit(color)
    @forfeit = color
  end

  def draw
    @draw = true
  end

  def isSwapped
    return @swapped
  end

  def isDraw
    return @draw
  end

  def isForfeit
    return (@forfeit != nil)
  end

  def setPlayer(num, name)
    if num == 1
      @player1 = name
    elsif num == 2
      @player2 = name
    end
  end

  def getPlayerName(num)
    if num == 1
      return @player1
    elsif num == 2
      return @player2
    end
    return nil
  end

  def isLinkDistance(dx, dy)
    return ((dx * dy).abs == 2)
  end

  def canLink(x1, y1, x2, y2)
    return (isPegAt(x1, y1) and isPegAt(x2, y2) and
            getColor(x1, y1) == getColor(x2, y2) and
            isLinkDistance(x1 - x2, y1 - y2) and
            !crossesExistingLink(x1, y1, x2, y2))
  end

  def crossesExistingLink(x1, y1, x2, y2)
    # Any crossing link has an endpoint in the (2,3) block that the link is in.
    minX, maxX = (x1 < x2)? [x1,x2] : [x2,x1]
    minY, maxY = (y1 < y2)? [y1,y2] : [y2,y1]

    # Loop thru all 6,
    for x in (minX .. maxX)
      for y in (minY .. maxY)
        # and filter out the 2 existing pegs.
        if not ((x == x1 and y == y1) or (x == x2 and y == y2))

           if crossesPegsLinks(x, y, x1, y1, x2, y2)
             return true
           end
#          peg = @board[x][y]
#          if peg != nil and peg.getColor != relevantColor
#            # if there's a peg there, test every link it's got.
#            forEachKnightNeighbor {|dx,dy|
#              if peg.hasLink(dx, dy) and
#                 doLinksCross(x1, y1, x2, y2, x, y, x + dx, y + dy)
#                return true
#              end
#            }
#          end
        end
      end
    end
                
    return false
  end

  def crossesPegsLinks(x, y, x1, y1, x2, y2)
    peg = @board[x][y]
    if peg != nil
      # if there's a peg there, test every link it's got.
      forEachKnightNeighbor {|dx,dy|
        if peg.hasLink(dx, dy) and
           doLinksCross(x1, y1, x2, y2, x, y, x + dx, y + dy)
          return true
        end
      }
    end
    return false
  end

  def doLinksCross(x1, y1, x2, y2, x3, y3, x4, y4)
    # Does (x1,y1)--(x2,y2) cross with (x3,y3)--(x4,y4)?
    # First, get the distance between the link centers,
    # times 2 to keep this in integer math.
    distX = (x1 + x2 - x3 - x4).abs
    distY = (y1 + y2 - y3 - y4).abs

    return (distX + distY < 3 and
             (distX == distY or
               (y2 - y1) * (x2 - x1) * (y4 - y3) * (x4 - x3) < 0))
  end

  def link(x1, y1, x2, y2, &block)
    if canLink(x1, y1, x2, y2)
      peg1 = @board[x1][y1]
      peg2 = @board[x2][y2]

      peg1.setLink(x2 - x1, y2 - y1)
      peg2.setLink(x1 - x2, y1 - y2)

      yield x1, y1, x2, y2
    end
  end

  def unlink(x1, y1, x2, y2)
    peg1 = @board[x1][y1]
    peg2 = @board[x2][y2]

    if peg1 != nil and peg2 != nil
      peg1.removeLink(x2 - x1, y2 - y1)
      peg2.removeLink(x1 - x2, y1 - y2)
    end
  end

  def isLinked(x1, y1, x2, y2)
    peg = @board[x1][y1]
    return (peg != nil and
            peg.hasLink(x2 - x1, y2 - y1))
  end
  
  def forEachKnightNeighbor
    for dx, dy in [[-1, -2], [-2, -1], [ 1, -2], [ 2, -1],
                   [-2,  1], [-1,  2], [ 2,  1], [ 1,  2]]
      yield dx, dy
    end
  end

  def searchForEdge(indexBoard, x, y, color, index)
    if ((color == :red   and y == @y-1) or
        (color == :black and x == @x-1))
      return true
    end

    indexBoard[x][y] = index
    peg = @board[x][y]
    forEachKnightNeighbor {|dx, dy|
      if peg.hasLink(dx,dy) and indexBoard[x + dx][y + dy] == nil and
         searchForEdge(indexBoard, x + dx, y + dy, color, index)
        return true
      end
    }
    return false
  end

  def forStartEdge(color)
    if color == :red
      for x in 0..@x-1
        yield x, 0
      end
    elsif color == :black
      for y in 0..@y-1
        yield 0, y
      end
    end
  end

  def winner
    if (hasWonPlayer(1))
      return 1
    elsif (hasWonPlayer(2))
      return 2
    elsif isDraw
      return 0
    end
    return nil
  end

  def result
    if (hasWonPlayer(1))
      return 1.0
    elsif (hasWonPlayer(2))
      return 0.0
    elsif isDraw
      return 0.5
    end
    return nil
  end

  def hasWonPlayer(num)
    if isSwapped
      return hasWonColor(3 - num)
    else
      return hasWonColor(num)
    end
  end

  def hasWonColor(color)
    if @resignation != nil
      return (@resignation != color)
    end
    if @forfeit != nil
      return (@forfeit != color)
    end
    if @draw
      return false
    end

    indexBoard = Array.new(@x).collect {|a| Array.new(@y, nil)}
    index = 0
    forStartEdge(color) { |x, y|
      if getColor(x, y) == color and indexBoard[x][y] == nil
        index += 1
        if searchForEdge(indexBoard, x, y, color, index)
          return true
        end
      end
    }
    return false
  end
end
