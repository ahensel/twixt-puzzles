# Twixt Puzzles

Interactive puzzle collection for the board game Twixt, featuring positions from real games and crafted challenges.

This is running online at [https://www.ibiblio.org/twixtpuzzles/](https://www.ibiblio.org/twixtpuzzles/)


## Features

- 60 carefully selected puzzles
- Interactive board
- Link removal
- Puzzle navigation
- Instant feedback

## Credits

- Original puzzles (1-40) by Alex Randolph, Twixt's designer
- Additional puzzles (41-60) by Alan Hensel
- Corrections to puzzles provided by David Bush
- All puzzles vetted for correctness by [Twixtbot](https://github.com/stevens68/twixtbot-ui)

## Resources

- Play Twixt online: [Little Golem](http://www.littlegolem.net/jsp/games/gamedetail.jsp?gtid=twixt)
- Learn more about Twixt on [Wikipedia](http://en.wikipedia.org/wiki/Twixt) and [BoardGameGeek](http://www.boardgamegeek.com/game/949)

## License

MIT License - See LICENSE file for details

## Technical details

This is written in Javascript, with no frameworks but plain ol' Ajax. It is a single-page app starting at `index.html`. To run locally, you will
need to start a local webserver, to avoid CORS issues. There are many options here, but I stick with:

```
python -m http.server 8000
```

Once that is running, you should be able to point the browser to `http://localhost:8000/`.

There is a PDF directory for generating these puzzles in printable form, but that has not been maintained.
