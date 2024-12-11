f = File::open("all_puzzles.txt")
puzzles = f.read.split(/$/)
f.close

for puzzle in puzzles
  if puzzle.strip.size > 0
    filename = 'p' + puzzle.match(/\d+/)[0] + '.txt'
    newFile = File.new(filename, "w")
    newFile.write(puzzle.strip)
    newFile.close
  end
end

