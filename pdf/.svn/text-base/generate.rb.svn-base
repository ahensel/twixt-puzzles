#!/usr/local/bin/ruby
require 'TwixtBoard'

def pegs(color, puzzleLine)
  postScriptText = ''
  moves = puzzleLine.split(' ')
  moves.each do | move |
    move.strip!
    x = move.downcase[0] - ('a'[0] - 1)
    y = move[1..move.size].to_i
    postScriptText += "#{x} #{y} " + (color == :black ? "blackPeg" : "whitePeg") + "\n"
    @board.setPegAndLink(x, y, color) { |x1, y1, x2, y2|
      postScriptText += "#{x1} #{y1} #{x2} #{y2} link\n"
    }
  end
  postScriptText
end

@across = 3
@down = 4

def pagePuzzleNumber(puzzleNumber)
  (puzzleNumber - 1) % (@across * @down)
end

def absoluteCoordinatesOf(puzzleNumber)
  pageX = pagePuzzleNumber(puzzleNumber) % @across
  pageY = pagePuzzleNumber(puzzleNumber) / @across
  
  leftMargin = 140
  bottomMargin = 10
  puzzleWidth = 275
  puzzleHeight = 290
  
  fromLeft = leftMargin + pageX * puzzleWidth
  fromBottom = (@down - pageY) * puzzleHeight + bottomMargin
  
  return fromLeft, fromBottom
end

def coordinatesOf(puzzleNumber)
  if pagePuzzleNumber(puzzleNumber) == 0
    return absoluteCoordinatesOf(puzzleNumber)
  else
    fromLeft, fromBottom = absoluteCoordinatesOf(puzzleNumber)
    prevLeft, prevBottom = absoluteCoordinatesOf(puzzleNumber - 1)
    return (fromLeft - prevLeft), (fromBottom - prevBottom)
  end
end

def getPostScriptPuzzleData(puzzleNumber, puzzleText)
  deltaX, deltaY = coordinatesOf(puzzleNumber)
  postScriptText = "(#{puzzleNumber}) #{deltaX} #{deltaY} makeBoard\n"

  @board = TwixtBoard.new(14, 14)

  puzzleText.split(';').each do |puzzlePart|
    puzzleGroup = puzzlePart.split(':')
    lineType = puzzleGroup[0].strip
    puzzleLine = puzzleGroup[1].strip
  
    case lineType
    when 'B'
      postScriptText += pegs(:black, puzzleLine)
    when 'W'
      postScriptText += pegs(:red, puzzleLine)
    end
  end
  postScriptText
end

postScriptText = File.read('header.ps')
pageHeader = File.read('pageheader.ps')
pageFooter = "showpage\n"

postScriptText += pageHeader

puzzleNumber = 0
while true
  puzzleNumber += 1
  begin
    puzzleText = File.read("../data/p#{puzzleNumber}.txt")
  rescue
    break
  end

  if puzzleNumber > 1 and pagePuzzleNumber(puzzleNumber) == 0
    postScriptText += pageFooter + pageHeader
  end

  postScriptText += getPostScriptPuzzleData(puzzleNumber, puzzleText)
end
postScriptText += pageFooter

out = File.open('twixtpuzzles.ps', 'w')
out.write(postScriptText)
out.close

`ps2pdf twixtpuzzles.ps`
# `rm twixtpuzzles.ps`