#!/usr/local/bin/ruby
require 'TwixtBoard'
require 'rubygems'
require 'prawn'

Prawn::Document.generate("twixtpuzzles.pdf") do
  @across = 3
  @down = 4
  
  @spacing = 10.8 
  @borderWidth = 0.6
  @pegRadius = 3.12
  @holeRadius = 0.93
  @linkWidth = 1.2
  @linkScale = 1 - @pegRadius / @spacing / Math::sqrt(5)
  
  def drawPegs(puzzleX, puzzleY, color, puzzleLine)
    line_width @linkWidth
    
    moves = puzzleLine.split(' ')
    moves.each do | move |
      move.strip!
      x = move.downcase[0] - ('a'[0] - 1)
      y = move[1..move.size].to_i
      
      @board.setPegAndLink(x, y, color) { |x1, y1, x2, y2|
        line [puzzleX + (x1 + (x2 - x1)*@linkScale)*@spacing + 9, puzzleY - (y1 + (y2 - y1)*@linkScale)*@spacing - 12], 
             [puzzleX + (x2 + (x1 - x2)*@linkScale)*@spacing + 9, puzzleY - (y2 + (y1 - y2)*@linkScale)*@spacing - 12]
        stroke
      }

      if color == :black
        circle_at [puzzleX + x*@spacing + 9, puzzleY - y*@spacing - 12], :radius => @pegRadius + (@linkWidth / 2)
        fill
      else
        circle_at [puzzleX + x*@spacing + 9, puzzleY - y*@spacing - 12], :radius => @pegRadius
        stroke
        
        fill_color "ffffff"
        circle_at [puzzleX + x*@spacing + 9, puzzleY - y*@spacing - 12], :radius => @pegRadius - (@linkWidth / 2)
        fill
        fill_color "000000"
      end
      
    end
    
  end
  
  def drawBorder(x, y, w, h)
    polygon [x, y], [x + w, y], [x + w, y - h], [x, y-h], [x, y], [x + 1, y]
    stroke
  end

  def pagePuzzleNumber(puzzleNumber)
    (puzzleNumber - 1) % (@across * @down)
  end

  def coordinatesOf(puzzleNumber)
    pagePuzzleNumber = pagePuzzleNumber(puzzleNumber)
    pageX = pagePuzzleNumber % @across
    pageY = pagePuzzleNumber / @across

    leftMargin = 39
    bottomMargin = -7
    puzzleWidth = 165
    puzzleHeight = 174

    fromLeft = leftMargin + pageX * puzzleWidth
    fromBottom = (@down - pageY) * puzzleHeight + bottomMargin

    return fromLeft, fromBottom
  end
    
  def drawPuzzle(puzzleNumber, puzzleText)
    x, y = coordinatesOf(puzzleNumber)
    
    # Puzzle title
    font 'trebb.ttf'
    text "#{puzzleNumber}. White to move:", :at => [x,y], :size => 9
    
    # Puzzle border
    line_width @borderWidth
    drawBorder(x, y-4, 144, 143)
    
    # Labels (letters across, numbers down)
    font_size 7.2
    letters = "ABCDEFGHIJKL".split('')
    loc = 10
    for letter in letters do
      bounding_box([x + loc, y - 12], :width => 20, :height => 7.2) do
        text letter, :align => :center
      end
      loc += @spacing
    end
    
    loc = -20
    for number in 1..12 do
      bounding_box([x, y + loc], :width => 14.5, :height => 7.2) do
        text number, :align => :right
      end
      loc -= @spacing
    end

    # Holes
    for v in 1..12 do
      for h in 1..12 do
        if v > 1 or h > 1
          circle_at [x + h*@spacing + 9, y - v*@spacing - 12], :radius => @holeRadius
        end
        fill
      end
    end

    # Borders
    line_width @borderWidth
    bx = x + 1.5*@spacing + 9
    by = y - 1.5*@spacing - 12
    bw = @spacing * 11
    polygon([bx+bw, by-1], [bx+1, by-1], [bx+1, by+1], [bx+bw, by+1])
    stroke
    polygon([bx+1, by-bw], [bx+1, by-1], [bx-1, by-1], [bx-1, by-bw])
    fill

    # pegs and links for this puzzle
    @board = TwixtBoard.new(14, 14)

    puzzleText.split(';').each do |puzzlePart|
      puzzleGroup = puzzlePart.split(':')
      lineType = puzzleGroup[0].strip
      puzzleLine = puzzleGroup[1].strip

      case lineType
      when 'B'
        drawPegs(x, y, :black, puzzleLine)
      when 'W'
        drawPegs(x, y, :red, puzzleLine)
      end
    end
  end

  def drawPageHeaderAndFooter
    font "treb.ttf"
    x, y = coordinatesOf(1)
    text "Twixt Puzzles", :at => [x + 2, y + 25], :size => 12

    bounding_box([0, 5], :width => 550, :height => 8) do
      text "http://www.ibiblio.org/twixtpuzzles/", :align => :center, :size => 7.2
    end
  end

  drawPageHeaderAndFooter
  puzzleNumber = 0
  while true
    puzzleNumber += 1
    begin
      puzzleText = File.read("../data/p#{puzzleNumber}.txt")
    rescue
      break
    end

    if puzzleNumber > 1 and pagePuzzleNumber(puzzleNumber) == 0
      start_new_page
      drawPageHeaderAndFooter
    end

    drawPuzzle(puzzleNumber, puzzleText)
  end
  
end
