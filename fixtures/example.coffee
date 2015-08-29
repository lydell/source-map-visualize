class Animal
  constructor: (@name) ->
    @moved = 0

  move: (distance) ->
    @moved += distance
    alert "#{@name} moved #{distance}m."

class Snake extends Animal
  move: ->
    alert "Slithering..."
    super 5

class Horse extends Animal
  constructor: ({@movement = 30}) ->
    super

  move: ->
    alert "Galloping..."
    super @movement

sam = new Snake "Sammy the Python"
tom = new Horse "Tommy the Palomino", movement: 45

sam.move() and tom.move() until tom.moved > 100

alert "Tommy moved #{tom.moved - sam.moved}m longer than Sammy."
