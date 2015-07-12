# Emojify

Emojify is a [useless](#can-i-run-emojified-code) tool that replaces boring variable names with their fun emoji counterparts. :poop::fire:

## Install
For command line use:

    npm install -g emojify

For programmatic use:

    npm install emojify
## Usage
Emojify is a drop-in replacement for [UglifyJS2](https://github.com/mishoo/UglifyJS2) with one major difference - it minifies your variables by default and replaces them with hilarious emojis. 

From the command line, run:
```
emojify input1.js [input2.js ...] [options]
```
Anything you can do with UglifyJS2 you can do with Emojify, with a few notable exceptions:
* `--mangle` and `--beautify` are turned on by default
* You can minify your code a little with `--compress` (`-c`) or a lot with `--uglify` (`-u`) 

### Examples
Let's run @mathias's String.fromCodePoint polyfill through some emojification

Our source file: `String-fromCodePoint.js`
```js
/*! https://mths.be/fromcodepoint v0.2.1 by @mathias */
if (!String.fromCodePoint) {
  (function() {
    var defineProperty = (function() {
      // IE 8 only supports `Object.defineProperty` on DOM elements
      try {
        var object = {};
        var $defineProperty = Object.defineProperty;
        var result = $defineProperty(object, object, object) && $defineProperty;
      } catch(error) {}
      return result;
    }());
    var stringFromCharCode = String.fromCharCode;
    var floor = Math.floor;
    var fromCodePoint = function(_) {
      var MAX_SIZE = 0x4000;
      var codeUnits = [];
      var highSurrogate;
      var lowSurrogate;
      var index = -1;
      var length = arguments.length;
      if (!length) {
        return '';
      }
      var result = '';
      while (++index < length) {
        var codePoint = Number(arguments[index]);
        if (
          !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
          codePoint < 0 || // not a valid Unicode code point
          codePoint > 0x10FFFF || // not a valid Unicode code point
          floor(codePoint) != codePoint // not an integer
        ) {
          throw RangeError('Invalid code point: ' + codePoint);
        }
        if (codePoint <= 0xFFFF) { // BMP code point
          codeUnits.push(codePoint);
        } else { // Astral code point; split in surrogate halves
          // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          codePoint -= 0x10000;
          highSurrogate = (codePoint >> 10) + 0xD800;
          lowSurrogate = (codePoint % 0x400) + 0xDC00;
          codeUnits.push(highSurrogate, lowSurrogate);
        }
        if (index + 1 == length || codeUnits.length > MAX_SIZE) {
          result += stringFromCharCode.apply(null, codeUnits);
          codeUnits.length = 0;
        }
      }
      return result;
    };
    if (defineProperty) {
      defineProperty(String, 'fromCodePoint', {
        'value': fromCodePoint,
        'configurable': true,
        'writable': true
      });
    } else {
      String.fromCodePoint = fromCodePoint;
    }
  }());
}
```
### Default behavior
Running `emojify /path/to/String-fromCodePoint.js` outputs:
```js
if (!String.fromCodePoint) {
    (function() {
        var 🚀 = function() {
            try {
                var 🚀 = {};
                var 💩 = Object.defineProperty;
                var 🔥 = 💩(🚀, 🚀, 🚀) && 💩;
            } catch (🍕) {}
            return 🔥;
        }();
        var 💩 = String.fromCharCode;
        var 🔥 = Math.floor;
        var 🍕 = function(🚀) {
            var 🍕 = 16384;
            var 🍔 = [];
            var 🍟;
            var 🍺;
            var 🍻 = -1;
            var 🐒 = arguments.length;
            if (!🐒) {
                return "";
            }
            var 🐶 = "";
            while (++🍻 < 🐒) {
                var 🐱 = Number(arguments[🍻]);
                if (!isFinite(🐱) || 🐱 < 0 || 🐱 > 1114111 || 🔥(🐱) != 🐱) {
                    throw RangeError("Invalid code point: " + 🐱);
                }
                if (🐱 <= 65535) {
                    🍔.push(🐱);
                } else {
                    🐱 -= 65536;
                    🍟 = (🐱 >> 10) + 55296;
                    🍺 = 🐱 % 1024 + 56320;
                    🍔.push(🍟, 🍺);
                }
                if (🍻 + 1 == 🐒 || 🍔.length > 🍕) {
                    🐶 += 💩.apply(null, 🍔);
                    🍔.length = 0;
                }
            }
            return 🐶;
        };
        if (🚀) {
            🚀(String, "fromCodePoint", {
                value: 🍕,
                configurable: true,
                writable: true
            });
        } else {
            String.fromCodePoint = 🍕;
        }
    })();
}
```
### More minification
Running `emojify /path/to/String-fromCodePoint.js -o /path/to/String-fromCodePoint.min.js -u` outputs:
```js
if(!String.fromCodePoint){(function(){var🚀=function(){try{var🚀={};var💩=Object.defineProperty;var🔥=💩(🚀,🚀,🚀)&&💩}catch(🍕){}return🔥}();var💩=String.fromCharCode;var🔥=Math.floor;var🍕=function(🚀){var🍕=16384;var🍔=[];var🍟;var🍺;var🍻=-1;var🐒=arguments.length;if(!🐒){return""}var🐶="";while(++🍻<🐒){var🐱=Number(arguments[🍻]);if(!isFinite(🐱)||🐱<0||🐱>1114111||🔥(🐱)!=🐱){throw RangeError("Invalid code point: "+🐱)}if(🐱<=65535){🍔.push(🐱)}else{🐱-=65536;🍟=(🐱>>10)+55296;🍺=🐱%1024+56320;🍔.push(🍟,🍺)}if(🍻+1==🐒||🍔.length>🍕){🐶+=💩.apply(null,🍔);🍔.length=0}}return🐶};if(🚀){🚀(String,"fromCodePoint",{value:🍕,configurable:true,writable:true})}else{String.fromCodePoint=🍕}})()}
```
to a new file located at `/path/to/String-fromCodePoint.min.js`
### Less minification but more emojis
You can go even harder by passing in `--mangle-props`. This not only replaces top-level variable names but also hunts down properties on objects.

Running `emojify /path/to/String-fromCodePoint.js --compress --mangle-props` outputs:
```js
String.🚀 || !function() {
    var 🚀 = function() {
        try {
            var 🚀 = {}, 💩 = Object.defineProperty, 🔥 = 💩(🚀, 🚀, 🚀) && 💩;
        } catch (🍕) {}
        return 🔥;
    }(), 💩 = String.fromCharCode, 🔥 = Math.floor, 🍕 = function(🚀) {
        var 🍕, 🍔, 🍟 = 16384, 🍺 = [], 🍻 = -1, 🐒 = arguments.length;
        if (!🐒) return "";
        for (var 🐶 = ""; ++🍻 < 🐒; ) {
            var 🐱 = Number(arguments[🍻]);
            if (!isFinite(🐱) || 0 > 🐱 || 🐱 > 1114111 || 🔥(🐱) != 🐱) throw RangeError("Invalid code point: " + 🐱);
            65535 >= 🐱 ? 🍺.push(🐱) : (🐱 -= 65536, 🍕 = (🐱 >> 10) + 55296, 🍔 = 🐱 % 1024 + 56320, 
            🍺.push(🍕, 🍔)), (🍻 + 1 == 🐒 || 🍺.length > 🍟) && (🐶 += 💩.apply(null, 🍺), 
            🍺.length = 0);
        }
        return 🐶;
    };
    🚀 ? 🚀(String, "fromCodePoint", {
        "💩": 🍕,
        "🔥": !0,
        "🍕": !0
    }) : String.🚀 = 🍕;
}();
```
### More usage
Read up on the rest of the commands [here](https://github.com/mishoo/UglifyJS2#usage)

## API Reference
Assuming installation via NPM, you can load Emojify in your application
like this:
```javascript
var Emojify = require("emojify");
```

There's a single top-level function which combines all the steps.
If you don't need additional customization, you might want to go with `minify`.
Example:
```javascript
var result = Emojify.minify("/path/to/file.js");
console.log(result.code); // minified output
// if you need to pass code instead of file name
var result = Emojify.minify("var b = function () {};", {fromString: true});
```

You can also compress multiple files:
```javascript
var result = Emojify.minify([ "file1.js", "file2.js", "file3.js" ]);
console.log(result.code);
```

Read up on the rest of the programmatic API [here](https://github.com/mishoo/UglifyJS2#api-reference)

## FAQs 
### Can I run Emojified code?
Nope :cry:

While ES6 brings stronger Unicode support to our beloved language, not all symbols can be used as valid identifiers. We can use things like `var ಠ_ಠ = 42`, but not `var 💩 = 43`.

@mathias has a great post explaining [the details of valid identifiers in ES6](https://mathiasbynens.be/notes/javascript-identifiers-es6)

### So what's the point?
Maybe one day ESXX will support emoji identifiers. Until then it's just for the lulz :joy:

### I want my own emojis, the ones you picked suck
You can do that:+1:

I've exposed the array of characters that Emojify uses to replace your variable names. Simply edit the array in `lib/manglers.js` with your emojis of choice. 

You can include any number of emojis in this array, but I recommend at least 40 different entires for enough combinations to cover a decent sized file. [Here's a good site to copy emojis from](http://classic.getemoji.com/).

You could grab some of the (more boring) [supported characters](https://raw.githubusercontent.com/mathiasbynens/unicode-8.0.0/master/properties/ID_Start/symbols.js) and produce actualy working code!

## Acknowledgements
This project would not exist without [UglifyJS](https://github.com/mishoo/UglifyJS2). Also, [@mathiasbynens](https://github.com/mathiasbynens) is a Unicode beast. I learned so much from his wonderful resources.
