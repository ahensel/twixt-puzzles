document.onmousedown = clickOnBoard
document.onmousemove = mouseOverBoard

Event.observe(window, 'load',
      function() { showPuzzle() }
    );

var moveRegExp = /[a-x][0-9][0-9]?|-\S*|\(.*\)/g
var turn = 1
var twixtGame = new TwixtController()
var cutLink = null
var holdingForMarkers = false
var numLinkableMarkers = 0

var puzzleText = null
var puzzleAnswers = null
var puzzleIfBlocks = null
var puzzleFalseStarts = null
var puzzleName = ''
var puzzleId = null
var answered = false
var showingPuzzle = false
var numTries = 0

//---- Buttons on puzzle board:
function nextPuzzle() {
  puzzleId++
  showPuzzle()
//  window.location.search = "id=" + puzzleId
}

function skipTo() {
  puzzleId = $F('puzzleNumber').replace(/^0*/, '')
  showPuzzle()
}

function resetBoard() {
  showPuzzleByText(puzzleText)
}

function tryAgain() {
  answered = false
  resetBoard()
  showWaitingForAnswerDiv()
}

function showAnswer() {
  $('wrongAnswerButtons').style.visibility = 'hidden'
  $('wrongAnswer').innerHTML = 'Correct answer is: ' + buildAnswerHTML()
  resetBoard()
}
//---- End of Buttons

function showWaitingForAnswerDiv() {
  $('right').style.visibility = 'hidden'
  $('wrong').style.visibility = 'hidden'
  $('waiting').style.visibility = 'visible'
  $('rightAnswer').innerHTML = ''
  $('wrongAnswer').innerHTML = ''
}
function showRightAnswerDiv() {
  $('numTries').innerHTML = "in " + numTries + (numTries == 1? " try!" : " tries")
  $('waiting').style.visibility = 'hidden'
  $('wrong').style.visibility = 'hidden'
  $('right').style.visibility = 'visible'
  $('rightAnswer').innerHTML = buildAnswerHTML()
}
function showWrongAnswerDiv() {
  $('waiting').style.visibility = 'hidden'
  $('right').style.visibility = 'hidden'
  $('wrong').style.visibility = 'visible'
  $('wrongAnswerButtons').style.visibility = ''
}

function focusNextPuzzleButton() {
  if ($('right').style.visibility == 'visible') {
    $('nextPuzzleButton').focus()
  }
  else if ($('wrong').style.visibility == 'visible') {
    if ($('wrongAnswerButtons').style.visibility != 'hidden') {
      $('tryAgainButton').focus()
    }
    else {
      $('nextPuzzleButton').focus()
    }
  }
  else {
    $('nextPuzzleButton').blur()
  }
}

function buildAnswerHTML() {
  var answer = ""

  answer = puzzleAnswers.match(moveRegExp).inject('', function(memo, move, index) {
    return (memo == ''? '': trim(move).charAt(0) == '('? memo + ' ': memo + ' or ') + getMoveText(1, move)
  })

  answer += "<br/>"
  answer += buildIfBlockHTML()
  answer += buildFalseStartsHTML()
  
  return answer
}

function buildIfBlockHTML() {
  var answer = ""
  
  if (puzzleIfBlocks.length > 0) {
    puzzleIfBlocks.each(function(ifBlock) {
      answer += "<br/>&nbsp;&nbsp;" + ("if".bold())
      answer += ifBlock.match(moveRegExp).inject('', function(memo, move, index) {
        return memo + " " + getMoveText(index+2, move)
      })
    })
  }
  return answer
}

function buildFalseStartsHTML() {
  var answer = ""

  if (puzzleFalseStarts.length > 0) {
    answer += "<br/>"
  
    if (puzzleFalseStarts.length == 1) {
      answer += "False start:".bold()
    }
    else if (puzzleFalseStarts.length > 1) {
      answer += "False starts:".bold()
    }
    puzzleFalseStarts.each(function(falseStart) {
      answer += "<br/>&nbsp;&nbsp;"
      answer += falseStart.match(moveRegExp).inject('', function(memo, move, index) {
        return memo + " " + getMoveText(index+1, move)
      })
    })
  }  
  return answer
}

function getMoveText(index, move) {
  if (trim(move).charAt(0) == '(') {
    return move.italics()
  }
  moveText = trim(move).toUpperCase()
  if (index % 2 == 1) moveText = moveText.bold()
  return (index + '.').fontcolor('#333333') + moveText
}

function isAnswerCorrect() {
  var moveText = twixtGame.getLastMoveText()
  return puzzleAnswers.match(moveRegExp).include(moveText)
}

function submitMove() {
  if (!showingPuzzle && !answered) {
    answered = true
    numTries ++

    if (isAnswerCorrect()) showRightAnswerDiv()
    else showWrongAnswerDiv()
  }
}

function getPuzzleId() {
  if (puzzleId == null) puzzleId = 1
  return puzzleId
//  var query = window.location.search
//  if (query == null || query.length == 0) return 1;
//  var id = query.split('=')[1]
//  return parseInt(id)
}

function showPuzzle() {
  puzzleId = getPuzzleId();
  
  new Ajax.Request('data/p' + puzzleId + '.txt', {
    asynchronous: true,
    method: "get",
    onSuccess: function(request) {
      answered = false
      numTries = 0
      showWaitingForAnswerDiv()
      showPuzzleByText(request.responseText)
    },
    onException: function(request, ex) {
      $('turn').innerHTML = "" + puzzleId + " <font color='red'>NOT FOUND</font>"
      alert('Could not find puzzle ' + puzzleId)
    }
  })
}

function showPuzzleByText(text) {
  showingPuzzle = true
  puzzleText = text
  clearBoard()
  var currentTurn = 0
  puzzleIfBlocks = new Array()
  puzzleFalseStarts = new Array()

  puzzleText.split(';').each(function(puzzlePart) {
    var puzzleLine = puzzlePart.split(':')
    var lineType = trim(puzzleLine[0])
    var puzzleLine = trim(puzzleLine[1])
    if      (lineType == 'N')  puzzleName = puzzleLine
    else if (lineType == 'A')  puzzleAnswers = puzzleLine
    else if (lineType == 'IF') puzzleIfBlocks.push(puzzleLine)
    else if (lineType == 'FS') puzzleFalseStarts.push(puzzleLine)
    else if (lineType == 'B')  placePuzzlePegs(0, puzzleLine)
    else if (lineType == 'W')  placePuzzlePegs(1, puzzleLine)
  })

  turn = 0  // white to move, always
  nextTurn()
  showingPuzzle = false
  twixtGame.clear()
  setTimeout("focusNextPuzzleButton()", 250)
}

function placePuzzlePegs(currentTurn, puzzleLine) {
  puzzleLine.split(' ').each(function(moveText) {
    turn = currentTurn
    placePegByNotation(moveText)
  })
}

function clearBoard() {
  turn = 1
  twixtGame = new TwixtController()
  cutLink = null
  holdingForMarkers = false
  numLinkableMarkers = 0
  
  var b = $('boardglass')
  for (var i = b.childNodes.length-1; i>=0; i--) {
    var childNode = b.childNodes[i]
    b.removeChild(childNode)
  }
}

function trim(s) {
  return s.replace(/^\s*/, '').replace(/\s*$/, '')
}

function placePegByNotation(pegString) {
  var x = pegString.toUpperCase().charCodeAt(0) - 64
  var y = parseInt(pegString.substr(1))
  
  placePeg(x, y)
}

// -----------------------------------------------------

function clickOnBoard(evt) {
  if (evt == null) {
    evt = event
  }
  var pixelX = (document.all)? evt.clientX : evt.pageX
  var pixelY = (document.all)? evt.clientY : evt.pageY

  if (isPegSpot(pixelX, pixelY))
  {
    var x = xCoord(pixelX)
    var y = yCoord(pixelY)
    var peg = twixtGame.board.getPeg(x, y)

    if (peg == null && !holdingForMarkers && twixtGame.board.isLegalSpot(x,y, turn)) {
      placePeg(x, y)
    }
    else if (peg != null && peg.color == turn) {
      placeLinks(peg, false)

      if (holdingForMarkers && numLinkableMarkers == 0) {
        nextTurn()
        holdingForMarkers = false
      }
    }
  }
  else if (cutLink != null) {
    executeCutLink()
  }

  if (yCoord(pixelY) < 13)
    setTimeout('focusNextPuzzleButton()', 250)

  return true
}

function placePeg(x, y)
{
  var peg = twixtGame.placePeg(x, y, turn)
  
  drawPeg(peg)
  placeLinks(peg, true)

  if (numLinkableMarkers == 0) {
    nextTurn()
  }
  else {
    holdingForMarkers = true
  }
}

function placeLinks(peg, isNew)
{
  twixtGame.addLinksTo(peg, isNew)
  drawLinks(peg)
  eraseLinkableMarkersAround(peg)
}

function executeCutLink()
{
  var link = cutLink
  link.remove()
  twixtGame.removeLink(link)

  eraseCutLink()
  eraseLink(link)
  drawLinkableMarkers(link)
}

function nextTurn()
{
  submitMove()

  turn = 1 - turn
  showTitle()
  drawLinkableMarkersInBox(1, 1, twixtGame.board.size, twixtGame.board.size, turn)
}

function showTitle() {
  $('turn').innerHTML = "" + puzzleName + ". " + ((turn==1)?'White' : 'Black') + " to move:"
}

function mouseOverBoard(evt) {
  if (evt == null) {
    evt = event
  }
  var pixelX = (document.all)? evt.clientX : evt.pageX
  var pixelY = (document.all)? evt.clientY : evt.pageY

  if (isPegSpot(pixelX, pixelY))
  {
    eraseCutLink()
    
    var x = xCoord(pixelX)
    var y = yCoord(pixelY)

    var peg = twixtGame.board.getPeg(x, y)

    if (!holdingForMarkers && twixtGame.board.isLegalSpot(x,y, turn) && peg == null) {
      drawCrosshair(x, y, turn)
    }
    else {
      eraseCrosshair()
    }
  }
  else
  {
    eraseCrosshair()

    link = getRemovableLink(pixelX, pixelY, turn)

    if (link != null) {
      drawCutLink(link)
    }
    else {
      eraseCutLink()
    }
  }
  return true
}

function drawLinks(peg)
{
  var links = peg.getLinks()
  for (var i=0; i<links.length; i++) {
    drawLink(links[i])
  }
}

function getLinkAt(x, y, dx, dy, turn)
{
    var peg = twixtGame.board.getPeg(x, y)
    if (peg != null && peg.color == turn) {
      return peg.getLink(dx, dy)
    }
    return null
}

function getRemovableLink(pixelX, pixelY, turn)
{
  var xd = xDelta(pixelX)  // pixel distance to nearest peg spot
  var yd = yDelta(pixelY)
  var sxd = sign(xd)
  var syd = sign(yd)
  var x = xCoord(pixelX - xd)  // nearest peg spot coordinates (doesn't need to contain a peg)
  var y = yCoord(pixelY - yd)

  // find nearby link - warning: heavy logic follows...
  if (Math.abs(xd) > Math.abs(yd)) { // Nearer horizontal
    return getLinkAt(x, y-1, sxd, 2, turn) || getLinkAt(x + sxd, y-1, -sxd, 2, turn) ||
      (yd != 0 ? (getLinkAt(x, y, 2 * sxd, syd, turn) || getLinkAt(x + sxd, y, -2 * sxd, syd, turn)) : null)
  }
  else if (Math.abs(xd) < Math.abs(yd)) { // Nearer vertical
    return getLinkAt(x-1, y, 2, syd, turn) || getLinkAt(x-1, y + syd, 2, -syd, turn) ||
      (xd != 0 ? (getLinkAt(x, y, sxd, 2 * syd, turn) || getLinkAt(x, y + syd, sxd, -2 * syd, turn)) : null)
  }
  else if (xd != 0 && yd != 0) { // On 45-degree diagonal, but not right on the peg
    return getLinkAt(x, y + syd, sxd, -2 * syd, turn) || getLinkAt(x + sxd, y, -2 * sxd, syd, turn)
  }
  return null
}

function sign(x) {
  return (x < 0)? -1:1
}

function isPegSpot(pixelX, pixelY) {
  var xd = xDelta(pixelX)
  var yd = yDelta(pixelY)
  // peg is a circle
  distSquared = xd*xd + yd*yd
  return (distSquared < 43)
}

function boardOffsetX() {
  return $('board').offsetLeft
}
function boardOffsetY() {
  return $('board').offsetTop
}

function xDelta(pixelX) {
  return pixelX - (xPixels(xCoord(pixelX)) + boardOffsetX() + 2)
}
function yDelta(pixelY) {
  return pixelY - (yPixels(yCoord(pixelY)) + boardOffsetY() + 2)
}
function xCoord(pixelX) {
  return Math.round((pixelX - 16 - boardOffsetX()) / 18)
}
function yCoord(pixelY) {
  return Math.round((pixelY - 15 - boardOffsetY()) / 18)
}
function xPixels(x) {
  return 14 + 18*x
}
function yPixels(y) {
  return 13 + 18*y
}

function drawPeg(peg) {
  var img = (peg.color == 0)? 'black': 'white'
  addImgToBoard('pieces/' + img + 'peg.gif', 'peg', xPixels(peg.x) - 6, yPixels(peg.y) - 6, 13, 13)
  eraseCrosshair()
}

function getMarkerName(x, y) {
  return 'marker_' + x + '_' + y
}

function drawLinkableMarkersInBox(minX, minY, maxX, maxY, color)
{
  for (var x = minX; x <= maxX; x++) {
    for (var y = minY; y <= maxY; y++) {
      if (twixtGame.isLinkable(x, y) && twixtGame.board.getPeg(x, y).color == color) {
        var markerName = getMarkerName(x, y)
        if ($(markerName) == null) {
          addImgToBoard('pieces/linkablemarker.gif', markerName, xPixels(x) - 6, yPixels(y) - 6, 13, 13)
          numLinkableMarkers++
        }
      }
    }
  }
}

function drawLinkableMarkers(link)
{
  drawLinkableMarkersInBox(link.minX() - 1, link.minY() - 1, link.maxX() + 1, link.maxY() + 1, link.peg1.color)
}

function eraseLinkableMarkersAround(peg)
{
  for (var x = peg.x - 3; x <= peg.x + 3; x++) {
    for (var y = peg.y - 3; y <= peg.y + 3; y++) {
      var markerName = getMarkerName(x, y)
      var m = $(markerName)
      if (m != null) {
        if (!twixtGame.isLinkable(x, y)) {
          var b = document.getElementById('boardglass')
          b.removeChild(m)
          numLinkableMarkers--
        }
      }
    }
  }
}

function eraseCrosshair() {
  var ch = $('crosshair')
  if (ch != null) {
    ch.style.display = "none"
  }
  eraseTickMarks()
}

function eraseTickMarks() {
  var vtick = $('vtick')
  if (vtick != null) {
    vtick.style.display = "none"
  }
  var htick = $('htick')
  if (htick != null) {
    htick.style.display = "none"
  }
}

function drawCrosshair(x, y, color) {
  var leftPos = xPixels(x)
  var topPos = yPixels(y)

  var ch = $('crosshair')
  if (ch != null) {
    ch.style.left = (leftPos - 6) + "px"
    ch.style.top = (topPos - 6) + "px"
    ch.style.display = "inline"
  }
  drawTickMarks(leftPos, topPos)
}

function drawTickMarks(leftPos, topPos) {
  var vtick = $('vtick')
  if (vtick == null) {
    vtick = buildTickMark('vtick', true)
    vtick.style.borderLeft = "1px dotted red"
    vtick.style.height = "11px"
  }
  vtick.style.left = leftPos + "px"
  vtick.style.display = "inline"
  
  var htick = $('htick')
  if (htick == null) {
    htick = buildTickMark('htick', false)
    htick.style.borderTop  = "1px dotted red"
    htick.style.width  = "11px"
  }
  htick.style.top = topPos + "px"
  htick.style.display = "inline"
}

function buildTickMark(id) {
  var tick = document.createElement("DIV")
  tick.setAttribute("id", id)
  tick.style.position = "absolute"
  tick.style.left = "1px"
  tick.style.top  = "1px"
  tick.style.width  = "0px"
  tick.style.height = "0px"
  var boardGlass = $('boardglass')
  if (boardGlass != null) boardGlass.appendChild(tick)  // race conditions on loading
  return tick
}

function eraseCutLink() {
  if (cutLink != null)
  {
    var linkElement = $('cut' + cutLink.getLinkName())
    cutLink = null
    if (linkElement != null) {
      $('boardglass').removeChild(linkElement)
    }
    eraseTickMarks()
  }
}

function eraseLink(link) {
  var linkElement = $('link' + link.getLinkName())
  if (linkElement != null) {
    $('boardglass').removeChild(linkElement)
  }
}

function drawLink(link) {
  drawLinkGeneral(link, 'link')
}

function drawCutLink(link) {
  if (cutLink != null && link.getLinkName() != cutLink.getLinkName()) {
    eraseCutLink()
  }
  drawLinkGeneral(link, 'cut')
  drawTickMarks((xPixels(link.peg1.x) + xPixels(link.peg2.x))/2, (yPixels(link.peg1.y) + yPixels(link.peg2.y))/2)
  cutLink = link
}

function drawLinkGeneral(link, linkType)
{
  var id = linkType + link.getLinkName()
  if ($(id) != null) return

  var dx = sign(link.peg1.y - link.peg2.y) * (link.peg1.x - link.peg2.x)

  var linkImg = 'pieces/' +
                ((dx == -2)? 'wsw':
                 (dx == -1)? 'ssw':
                 (dx ==  1)? 'sse':
                             'ese') + linkType + '.gif'
  var leftPos = xPixels(link.minX())
  var topPos = yPixels(link.minY())

  if (Math.abs(dx) == 1) {
    addImgToBoard(linkImg, id, leftPos + 2, topPos + 5, 15, 27)
  }
  else {
    addImgToBoard(linkImg, id, leftPos + 5, topPos + 2, 27, 15)
  }
}

function addImgToBoard(imgfile, id, leftPos, topPos, width, height)
{
  var b = $('boardglass')

  // Safari needs this, so the box doesn't grow
  b.style.width = "240px"

  img = document.createElement("IMG")
  img.setAttribute("src", imgfile)
  img.setAttribute("width", width)
  img.setAttribute("height", height)
  img.setAttribute("id", id)
  img.style.position = "absolute"
  img.style.left = leftPos + "px"
  img.style.top = topPos + "px"
  b.appendChild(img)
}
