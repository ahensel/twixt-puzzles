# Twixt Puzzles

Interactive puzzle collection for the board game Twixt, featuring positions from real games and crafted challenges.


## Features

- 60 carefully selected puzzles
- Interactive board
- Link removal
- Puzzle navigation
- Instant feedback

## Credits

- Original puzzles (1-40) by Alex Randolph, Twixt's designer
- Additional puzzles by Alan Hensel

## Resources

- Play online: [Little Golem](http://www.littlegolem.net/jsp/games/gamedetail.jsp?gtid=twixt)
- Learn more: [Wikipedia](http://en.wikipedia.org/wiki/Twixt)
- Game info: [BoardGameGeek](http://www.boardgamegeek.com/game/949)

## License

MIT License - See LICENSE file for details

## Technical details

This is written in Javascript, with no frameworks but plain ol' Ajax. It is a single-page app starting at `index.html`. To run locally, you will
need to start a local webserver, to avoid CORS issues. There are many options here, but I stick with:

```
python -m http.server 8000
```

Once that is running, you should be able to point the browser to `http://localhost:8000/`.

