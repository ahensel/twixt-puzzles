document.addEventListener('mousedown', clickOnBoard);
document.addEventListener('mousemove', mouseOverBoard);

window.addEventListener('popstate', (event) => {
  updatePuzzleIdFromURL();
  showPuzzle();
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('puzzleNumber').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      skipTo();
      return false;
    }
  });

  updatePuzzleIdFromURL();
  showPuzzle();
});

const moveRegExp = /[a-x][0-9][0-9]?|-\S*|\(.*\)/g;
let turn = 1;
let twixtGame = new TwixtController();
let cutLink = null;
let holdingForMarkers = false;
let numLinkableMarkers = 0;

let puzzleText = null;
let puzzleAnswers = null;
let puzzleIfBlocks = null;
let puzzleFalseStarts = null;
let puzzleName = '';
let puzzleId = null;
let answered = false;
let showingPuzzle = false;
let numTries = 0;

function updatePuzzleIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlPuzzleId = urlParams.get('id');
  if (urlPuzzleId) {
    puzzleId = urlPuzzleId.trim().replace(/^0*/, '');
  }
  else {
    puzzleId = 1;
  }

  if (!puzzleId) puzzleId = 1;
}

//---- Buttons on puzzle board:
function updateURLfromPuzzleId() {
  const newURL = new URL(window.location);
  newURL.searchParams.set('id', puzzleId);
  window.history.pushState({}, '', newURL);
}

function nextPuzzle() {
  puzzleId++;
  updateURLfromPuzzleId();
  showPuzzle();
}

function skipTo() {
  puzzleId = document.getElementById('puzzleNumber').value.trim().replace(/^0*/, '');
  if (puzzleId) {
    updateURLfromPuzzleId();
    showPuzzle();
  }
}

function resetBoard() {
  showPuzzleByText(puzzleText);
}

function tryAgain() {
  answered = false;
  resetBoard();
  showWaitingForAnswerDiv();
}

function showAnswer() {
  document.getElementById('wrongAnswerButtons').hidden = true;
  document.getElementById('wrongAnswer').innerHTML = `Correct answer is: ${buildAnswerHTML()}`;
  resetBoard();
}
//---- End of Buttons

function showWaitingForAnswerDiv() {
  document.getElementById('right').style.visibility = 'hidden';
  document.getElementById('wrong').style.visibility = 'hidden';
  document.getElementById('waiting').style.visibility = 'visible';
  document.getElementById('rightAnswer').innerHTML = '';
  document.getElementById('wrongAnswer').innerHTML = '';
}

function showRightAnswerDiv() {
  document.getElementById('numTries').textContent = "in " + numTries + (numTries === 1? " try!" : " tries");
  document.getElementById('waiting').style.visibility = 'hidden';
  document.getElementById('wrong').style.visibility = 'hidden';
  document.getElementById('right').style.visibility = 'visible';
  document.getElementById('rightAnswer').innerHTML = buildAnswerHTML();
}
function showWrongAnswerDiv() {
  document.getElementById('waiting').style.visibility = 'hidden';
  document.getElementById('right').style.visibility = 'hidden';
  document.getElementById('wrong').style.visibility = 'visible';
  document.getElementById('wrongAnswerButtons').style.visibility = '';
}

function focusNextPuzzleButton() {
  if (document.getElementById('right').style.visibility === 'visible') {
    document.getElementById('nextPuzzleButton').focus();
  }
  else if (document.getElementById('wrong').style.visibility === 'visible') {
    if (document.getElementById('wrongAnswerButtons').style.visibility !== 'hidden') {
      document.getElementById('tryAgainButton').focus();
    }
    else {
      document.getElementById('nextPuzzleButton').focus();
    }
  }
  else {
    document.getElementById('nextPuzzleButton').blur();
  }
}

function buildAnswerHTML() {
  let answer = puzzleAnswers.match(moveRegExp).reduce((memo, move) => {
    return (memo === '' ? '' : memo.trim().endsWith(' ') ? memo + ' ' : memo + ' or ') + getMoveText(1, move);
  }, '');

  answer += "<br/>";
  answer += buildIfBlockHTML();
  answer += buildFalseStartsHTML();
  
  return answer;
}

function buildIfBlockHTML() {
  let answer = "";
  
  if (puzzleIfBlocks.length > 0) {
    puzzleIfBlocks.forEach(ifBlock => {
      answer += "<br/>&nbsp;&nbsp;" + ("if".bold());
      answer += ifBlock.match(moveRegExp).reduce((memo, move, index) => {
        return memo + " " + getMoveText(index+2, move);
      }, '');
    });
  }
  return answer;
}

function buildFalseStartsHTML() {
  let answer = "";

  if (puzzleFalseStarts.length > 0) {
    answer += "<br/>";
  
    if (puzzleFalseStarts.length === 1) {
      answer += "False start:".bold();
    }
    else if (puzzleFalseStarts.length > 1) {
      answer += "False starts:".bold();
    }
    puzzleFalseStarts.forEach(falseStart => {
      answer += "<br/>&nbsp;&nbsp;";
      answer += falseStart.match(moveRegExp).reduce((memo, move, index) => {
        return memo + " " + getMoveText(index+1, move);
      }, '');
    });
  }  
  return answer;
}

function getMoveText(index, move) {
  if (trim(move).charAt(0) === '(') {
    return move.italics();
  }
  moveText = trim(move).toUpperCase()
  if (index % 2 === 1) moveText = moveText.bold();
  return (index + '.').fontcolor('#333333') + moveText;
}

function isAnswerCorrect() {
  const moveText = twixtGame.getLastMoveText();
  return puzzleAnswers.match(moveRegExp).includes(moveText);
}

function submitMove() {
  if (!showingPuzzle && !answered) {
    answered = true;
    numTries ++;

    if (isAnswerCorrect()) showRightAnswerDiv();
    else showWrongAnswerDiv();
  }
}

function getPuzzleId() {
  if (!puzzleId) puzzleId = 1;
  return puzzleId;
}

function showPuzzle() {
  puzzleId = getPuzzleId();

  fetch('data/p' + puzzleId + '.txt')
    .then(response => {
      if (!response.ok) {
        alert('Could not find puzzle ' + puzzleId);
        return;
      }

      answered = false;
      numTries = 0;
      showWaitingForAnswerDiv();

      response.text().then(text => {
        showPuzzleByText(text);
      });
    });
}

function showPuzzleByText(text) {
  showingPuzzle = true;
  puzzleText = text;
  clearBoard();
  puzzleIfBlocks = [];
  puzzleFalseStarts = [];

  puzzleText.split(';').forEach(puzzlePart => {
    const puzzleParts = puzzlePart.split(':');
    const lineType = trim(puzzleParts[0]);
    const puzzleLine = trim(puzzleParts[1]);
    if      (lineType === 'N')  puzzleName = puzzleLine;
    else if (lineType === 'A')  puzzleAnswers = puzzleLine;
    else if (lineType === 'IF') puzzleIfBlocks.push(puzzleLine);
    else if (lineType === 'FS') puzzleFalseStarts.push(puzzleLine);
    else if (lineType === 'B')  placePuzzlePegs(0, puzzleLine);
    else if (lineType === 'W')  placePuzzlePegs(1, puzzleLine);
  });

  turn = 0;  // white to move, always
  nextTurn();
  showingPuzzle = false;
  twixtGame.clear();
  setTimeout("focusNextPuzzleButton()", 250);
}

function placePuzzlePegs(currentTurn, puzzleLine) {
  puzzleLine.split(' ').forEach(moveText => {
    turn = currentTurn;
    placePegByNotation(moveText);
  });
}

function clearBoard() {
  turn = 1;
  twixtGame = new TwixtController();
  cutLink = null;
  holdingForMarkers = false;
  numLinkableMarkers = 0;
  
  const b = document.getElementById('boardglass');
  for (let i = b.childNodes.length-1; i>=0; i--) {
    const childNode = b.childNodes[i];
    b.removeChild(childNode);
  }
}

function trim(s) {
  return s.replace(/^\s*/, '').replace(/\s*$/, '');
}

function placePegByNotation(pegString) {
  const x = pegString.toUpperCase().charCodeAt(0) - 64;
  const y = parseInt(pegString.substr(1));
  
  placePeg(x, y);
}

// -----------------------------------------------------

function clickOnBoard(evt) {
  if (!evt) {
    evt = event;
  }
  const pixelX = (document.all)? evt.clientX : evt.pageX;
  const pixelY = (document.all)? evt.clientY : evt.pageY;

  if (isPegSpot(pixelX, pixelY))
  {
    const x = xCoord(pixelX);
    const y = yCoord(pixelY);
    const peg = twixtGame.board.getPeg(x, y);

    if (!peg && !holdingForMarkers && twixtGame.board.isLegalSpot(x,y, turn)) {
      placePeg(x, y);
    }
    else if (!!peg && peg.color === turn) {
      placeLinks(peg, false);

      if (holdingForMarkers && numLinkableMarkers === 0) {
        nextTurn();
        holdingForMarkers = false;
      }
    }
  }
  else if (cutLink) {
    executeCutLink();
  }

  if (yCoord(pixelY) < 13)
    setTimeout('focusNextPuzzleButton()', 250);

  return true;
}

function placePeg(x, y)
{
  const peg = twixtGame.placePeg(x, y, turn);
  
  drawPeg(peg);
  placeLinks(peg, true);

  if (numLinkableMarkers === 0) {
    nextTurn();
  }
  else {
    holdingForMarkers = true;
  }
}

function placeLinks(peg, isNew)
{
  twixtGame.addLinksTo(peg, isNew);
  drawLinks(peg);
  eraseLinkableMarkersAround(peg);
}

function executeCutLink()
{
  const link = cutLink;
  link.remove();
  twixtGame.removeLink(link);

  eraseCutLink();
  eraseLink(link);
  drawLinkableMarkers(link);
}

function nextTurn()
{
  submitMove();

  turn = 1 - turn;
  showTitle();
  drawLinkableMarkersInBox(1, 1, twixtGame.board.size, twixtGame.board.size, turn);
}

function showTitle() {
  document.getElementById('turn').innerHTML = "" + puzzleName + ". " + ((turn===1)?'White' : 'Black') + " to move:";
}

function mouseOverBoard(evt) {
  if (!evt) {
    evt = event;
  }
  const pixelX = (document.all)? evt.clientX : evt.pageX;
  const pixelY = (document.all)? evt.clientY : evt.pageY;

  if (isPegSpot(pixelX, pixelY))
  {
    eraseCutLink();
    
    const x = xCoord(pixelX);
    const y = yCoord(pixelY);

    const peg = twixtGame.board.getPeg(x, y);

    if (!holdingForMarkers && twixtGame.board.isLegalSpot(x,y, turn) && !peg) {
      drawCrosshair(x, y, turn);
    }
    else {
      eraseCrosshair();
    }
  }
  else
  {
    eraseCrosshair();

    link = getRemovableLink(pixelX, pixelY, turn);

    if (link) {
      drawCutLink(link);
    }
    else {
      eraseCutLink();
    }
  }
  return true;
}

function drawLinks(peg)
{
  peg.getLinks().forEach(link => drawLink(link, 'link'));
}

function getLinkAt(x, y, dx, dy, turn)
{
    const peg = twixtGame.board.getPeg(x, y);
    if (peg && peg.color === turn) {
      return peg.getLink(dx, dy);
    }
    return null;
}

function getRemovableLink(pixelX, pixelY, turn)
{
  const xd = xDelta(pixelX);  // pixel distance to nearest peg spot
  const yd = yDelta(pixelY);
  const sxd = sign(xd);
  const syd = sign(yd);
  const x = xCoord(pixelX - xd);  // nearest peg spot coordinates (doesn't need to contain a peg)
  const y = yCoord(pixelY - yd);

  // find nearby link - warning: heavy logic follows...
  if (Math.abs(xd) > Math.abs(yd)) { // Nearer horizontal
    return getLinkAt(x, y-1, sxd, 2, turn) || getLinkAt(x + sxd, y-1, -sxd, 2, turn) ||
      (yd !== 0 ? (getLinkAt(x, y, 2 * sxd, syd, turn) || getLinkAt(x + sxd, y, -2 * sxd, syd, turn)) : null);
  }
  else if (Math.abs(xd) < Math.abs(yd)) { // Nearer vertical
    return getLinkAt(x-1, y, 2, syd, turn) || getLinkAt(x-1, y + syd, 2, -syd, turn) ||
      (xd !== 0 ? (getLinkAt(x, y, sxd, 2 * syd, turn) || getLinkAt(x, y + syd, sxd, -2 * syd, turn)) : null);
  }
  else if (xd !== 0 && yd !== 0) { // On 45-degree diagonal, but not right on the peg
    return getLinkAt(x, y + syd, sxd, -2 * syd, turn) || getLinkAt(x + sxd, y, -2 * sxd, syd, turn);
  }
  return null;
}

function sign(x) {
  return (x < 0)? -1 : 1;
}

function isPegSpot(pixelX, pixelY) {
  const xd = xDelta(pixelX);
  const yd = yDelta(pixelY);
  // peg is a circle
  distSquared = xd*xd + yd*yd;
  return (distSquared < 43);
}

function boardOffsetX() {
  return document.getElementById('board').offsetLeft;
}
function boardOffsetY() {
  return document.getElementById('board').offsetTop;
}

function xDelta(pixelX) {
  return pixelX - (xPixels(xCoord(pixelX)) + boardOffsetX() + 2);
}
function yDelta(pixelY) {
  return pixelY - (yPixels(yCoord(pixelY)) + boardOffsetY() + 2);
}
function xCoord(pixelX) {
  return Math.round((pixelX - 16 - boardOffsetX()) / 18);
}
function yCoord(pixelY) {
  return Math.round((pixelY - 15 - boardOffsetY()) / 18);
}
function xPixels(x) {
  return 14 + 18*x;
}
function yPixels(y) {
  return 13 + 18*y;
}

function drawPeg(peg) {
  const img = (peg.color === 0)? 'black': 'white';
  addImgToBoard(PEG_IMAGES[img + 'peg_img'], 'peg', xPixels(peg.x) - 6, yPixels(peg.y) - 6, 13, 13);
  eraseCrosshair();
}

function getMarkerName(x, y) {
  return 'marker_' + x + '_' + y;
}

function drawLinkableMarkersInBox(minX, minY, maxX, maxY, color)
{
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      if (twixtGame.isLinkable(x, y) && twixtGame.board.getPeg(x, y).color === color) {
        const markerName = getMarkerName(x, y);
        if (!document.getElementById(markerName)) {
          addImgToBoard(linkablemarker_img, markerName, xPixels(x) - 6, yPixels(y) - 6, 13, 13);
          numLinkableMarkers++;
        }
      }
    }
  }
}

function drawLinkableMarkers(link)
{
  drawLinkableMarkersInBox(link.minX() - 1, link.minY() - 1, link.maxX() + 1, link.maxY() + 1, link.peg1.color);
}

function eraseLinkableMarkersAround(peg)
{
  const b = document.getElementById('boardglass');

  for (let x = peg.x - 3; x <= peg.x + 3; x++) {
    for (let y = peg.y - 3; y <= peg.y + 3; y++) {
      const markerName = getMarkerName(x, y);
      const m = document.getElementById(markerName);
      if (m && !twixtGame.isLinkable(x, y)) {
        b.removeChild(m);
        numLinkableMarkers--;
      }
    }
  }
}

function eraseCrosshair() {
  const ch = document.getElementById('crosshair');
  if (ch) {
    ch.style.display = "none";
  }
  eraseTickMarks();
}

function eraseTickMarks() {
  const vtick = document.getElementById('vtick');
  if (vtick) {
    vtick.style.display = "none";
  }
  const htick = document.getElementById('htick');
  if (htick) {
    htick.style.display = "none";
  }
}

function drawCrosshair(x, y, color) {
  const leftPos = xPixels(x);
  const topPos = yPixels(y);

  const ch = document.getElementById('crosshair');
  if (ch) {
    Object.assign(ch.style, {
      left: (leftPos - 6) + 'px',
      top: (topPos - 6) + 'px',
      display: 'inline'
    });
  }
  drawTickMarks(leftPos, topPos);
}

function drawTickMarks(leftPos, topPos) {
  const vtick = document.getElementById('vtick') || buildTickMark('vtick');
  Object.assign(vtick.style, {
    borderLeft: '1px dotted red',
    height: '11px',
    left: `${leftPos}px`,
    display: 'inline'
  });
  
  const htick = document.getElementById('htick') || buildTickMark('htick');
  Object.assign(htick.style, {
    borderTop: '1px dotted red',
    width: '11px',
    top: `${topPos}px`,
    display: 'inline'
  });
}

function buildTickMark(id) {
  const tick = document.createElement('div');
  Object.assign(tick, { id });
  Object.assign(tick.style, {
    position: 'absolute',
    left: '1px',
    top: '1px',
    width: '0',
    height: '0'
  });
  const boardGlass = document.getElementById('boardglass');
  if (boardGlass) boardGlass.appendChild(tick);  // race conditions on loading
  return tick;
}

function eraseCutLink() {
  if (cutLink)
  {
    const linkElement = document.getElementById('cut' + cutLink.getLinkName());
    cutLink = null;
    if (linkElement) {
      document.getElementById('boardglass').removeChild(linkElement);
    }
    eraseTickMarks();
  }
}

function eraseLink(link) {
  const linkElement = document.getElementById('link' + link.getLinkName());
  if (linkElement) {
    document.getElementById('boardglass').removeChild(linkElement);
  }
}

function drawCutLink(link) {
  if (cutLink && link.getLinkName() !== cutLink.getLinkName()) {
    eraseCutLink();
  }
  drawLink(link, 'cut');
  drawTickMarks((xPixels(link.peg1.x) + xPixels(link.peg2.x))/2, (yPixels(link.peg1.y) + yPixels(link.peg2.y))/2);
  cutLink = link;
}

function drawLink(link, linkType) {
  const id = linkType + link.getLinkName();
  if (document.getElementById(id)) return;

  const dx = sign(link.peg1.y - link.peg2.y) * (link.peg1.x - link.peg2.x);

  const linkImg = LINK_IMAGES[
                ((dx === -2)? 'wsw':
                 (dx === -1)? 'ssw':
                 (dx ===  1)? 'sse':
                              'ese') + linkType + '_img'];
  const leftPos = xPixels(link.minX());
  const topPos = yPixels(link.minY());

  if (Math.abs(dx) === 1) {
    addImgToBoard(linkImg, id, leftPos + 2, topPos + 5, 15, 27);
  }
  else {
    addImgToBoard(linkImg, id, leftPos + 5, topPos + 2, 27, 15);
  }
}

function addImgToBoard(imgfile, id, leftPos, topPos, width, height)
{
  const b = document.getElementById('boardglass');

  img = document.createElement("img");
  Object.assign(img, {
    src: imgfile,
    width,
    height,
    id
  });
  Object.assign(img.style, {
    position: "absolute",
    left: `${leftPos}px`,
    top: `${topPos}px`
  });
  b.appendChild(img);
}
