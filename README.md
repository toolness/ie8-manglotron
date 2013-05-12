This is a stupid static file server that instruments JS with
[esprima][] and [falafel][] to make debugging easier on IE8.

Specifically, it:

* Hacks computed property lookups to ensure that strings aren't being
  indexed like arrays, since this is supported on most browsers except IE8
  and is hard to debug (as it simply returns `undefined` rather than
  throwing an exception).
* Performs its own stack tracing to provide decent tracebacks.

I made this to get [nunjucks][] to [work on IE8][]. Perhaps it can be
used by others in the future.

Apologies for the horrible code and complete absence of tests.

## Quick Start

    git checkout git://github.com/toolness/ie8-manglotron.git
    cd ie8-manglotron
    npm install

At this point you can run the `server.js` script via `node` from any
directory on your filesystem, and it will statically serve files in that 
directory, mangling any outbound JS.

  [esprima]: http://esprima.org/
  [falafel]: https://github.com/substack/node-falafel
  [nunjucks]: http://nunjucks.jlongster.com/
  [work on IE8]: https://github.com/jlongster/nunjucks/pull/75
