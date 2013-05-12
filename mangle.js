var fs = require('fs');
var falafel = require('./falafel');

function propertyAsString(node) {
  if ((!node.computed && node.property.type == 'Identifier'))
    return JSON.stringify(node.property.source());
  return node.property.source();
}

function getPropertyMangler(node, where) {
  if (node.type == 'MemberExpression') {
    if (!node.computed)
      return;
    if (node.parent.type == 'UnaryExpression' &&
        node.parent.operator == 'delete')
      return;
    if (node.parent.type == 'AssignmentExpression' &&
        node.parent.left === node)
      return;
    if (node.parent.type == 'UpdateExpression' &&
        node.parent.argument === node)
      return;
    if (node.parent.type == 'CallExpression' &&
        node.parent.callee === node)
      return;
    node.update('Manglotron.getProperty(' + node.object.source() + ', ' +
                propertyAsString(node) + ', ' +
                JSON.stringify(where) + ')');
  }
}

function addAdvancers(body) {
  var source = [];
  body.forEach(function(stmt) {
    source.push('Manglotron.advanceTo(' + stmt.loc.start.line + ', ' +
                stmt.loc.start.column + ');');
    source.push(stmt.source());
  });
  source = '{' + source.join('') + '}';
  return source;
}

function functionMangler(node, where) {
  if (node.type == "BlockStatement") {
    if (node.parent.type == "FunctionExpression" ||
        node.parent.type == "FunctionDeclaration") {
      var name = node.parent.id ? node.parent.id.name : 'anonymous';
      var blockSource = addAdvancers(node.body);
      var params = node.parent.params.map(function(param) {
        return param.name;
      }).join(', ');
      node.update('{ Manglotron.pushStack(' +
                    JSON.stringify(name) + ', ' +
                    JSON.stringify(where) + 
                  '); try { return (function(' + params + ')' + blockSource +
                  ').apply(this, arguments); } catch (e) { ' +
                  'Manglotron.reportError(e); throw e; } finally { ' + 
                  'Manglotron.popStack(); } }');
    } else {
      node.update(addAdvancers(node.body));
    }
  }
}

var mangle = module.exports = function mangle(src, filename) {
  var preamble = fs.readFileSync(__dirname + '/preamble.js', 'utf8');
  var output = falafel(src, {loc: true}, function(node) {
    var where = [
      filename,
      node.loc.start.line,
      node.loc.start.column
    ];
    functionMangler(node, where);
    getPropertyMangler(node, where);
  });
  return preamble + output.toString();
};

if (!module.parent) {
  var filename = process.argv[2];
  var input = fs.readFileSync(filename, 'utf8');
  process.stdout.write(mangle(input, filename));
}
