
class Move

  def initialize(x, y, player)
    @x = x
    @y = y
    @player = player
  end

  def getPlayer
    return @player
  end

  def getX
    return @x
  end

  def getY
    return @y
  end

  def getText
    letters = "abcdefghijklmnopqrstuvwxyz"
    return letters[@x..@x] + String(@y + 1)
  end
end
