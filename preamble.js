(function(global) {
  if (global.Manglotron)
    return;

  var warn = function(msg, where) {
    console.warn(where.join(':') + ": " + msg);
  };

  global.Manglotron = {
    stack: [],
    advanceTo: function(line, col) {
      if (this.stack.length) {
        var currFrame = this.stack[this.stack.length - 1];
        currFrame[1][1] = line;
        currFrame[1][2] = col;
      }
    },
    pushStack: function(name, where) { this.stack.push([name, where]); },
    popStack: function() { this.stack.pop(); },
    reportError: function(e) {
      if (e.manglotronStack) return;
      var lines = [e.toString()];
      var copy = this.stack.slice();
      copy.reverse();
      for (var i = 0; i < copy.length; i++) {
        var funcname = copy[i][0];
        var where = copy[i][1];
        lines.push("  at " + funcname + " (" + where.join(":") + ")");
      }
      e.manglotronStack = lines.join('\n');
      console.error(e.manglotronStack);
    },
    getProperty: function(obj, prop, where) {
      if (typeof(obj) == "string" && typeof(prop) == "number") {
        warn("String array indexing doesn't work in IE8. " +
             "Use String.charAt() instead.", where);
      }
      return obj[prop];
    }
  };
})(typeof(window) != "undefined" ? window : global);
