// Generated by CoffeeScript 1.9.3
(function() {
  var Animal, Horse, Snake, sam, tom,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Animal = (function() {
    function Animal(name) {
      this.name = name;
      this.moved = 0;
    }

    Animal.prototype.move = function(distance) {
      this.moved += distance;
      return alert(this.name + " moved " + distance + "m.");
    };

    return Animal;

  })();

  Snake = (function(superClass) {
    extend(Snake, superClass);

    function Snake() {
      return Snake.__super__.constructor.apply(this, arguments);
    }

    Snake.prototype.move = function() {
      alert("Slithering...");
      return Snake.__super__.move.call(this, 5);
    };

    return Snake;

  })(Animal);

  Horse = (function(superClass) {
    extend(Horse, superClass);

    function Horse(arg) {
      var ref;
      this.movement = (ref = arg.movement) != null ? ref : 30;
      Horse.__super__.constructor.apply(this, arguments);
    }

    Horse.prototype.move = function() {
      alert("Galloping...");
      return Horse.__super__.move.call(this, this.movement);
    };

    return Horse;

  })(Animal);

  sam = new Snake("Sammy the Python");

  tom = new Horse("Tommy the Palomino", {
    movement: 45
  });

  while (!(tom.moved > 100)) {
    sam.move() && tom.move();
  }

  alert("Tommy moved " + (tom.moved - sam.moved) + "m longer than Sammy.");

}).call(this);

//# sourceMappingURL=example.js.map
