"use strict";
function identity(n) { return n; }
var Parser = (function () {
    function Parser(f) {
        var _this = this;
        this.f = f;
        this.run = function (input) { return _this.f(input); };
    }
    Parser.zero = function () {
        return new Parser(function (input) { return []; });
    };
    // a -> m a
    Parser.unit = function (v) {
        return new Parser(function (input) { return [{ lexeme: v, source: input }]; });
    };
    // m a -> (a -> m b) -> m b
    Parser.bind = function (p, f) {
        return new Parser(function (input) {
            // apply f to the lexeme while applying this.f on the source
            var result = p.run(input).map(function (o) { return f(o.lexeme).run(o.source); });
            return result.reduce(function (b, a) { return b.concat(a); }, []); // flatten
        });
    };
    Parser.plus = function (p1, p2) {
        return new Parser(function (input) { return p1.run(input).concat(p2.run(input)); });
    };
    Parser.sat = function (p) {
        if (p === void 0) { p = function (s) { return true; }; }
        return Parser.bind(Parser.item(), function (x) { return p(x) ? Parser.unit(x) : Parser.zero(); });
    };
    Parser.item = function () { return new Parser(function (input) {
        if (input.length) {
            var _a = input.split(""), head = _a[0], tail = _a.slice(1);
            return [{ lexeme: head, source: tail.join("") }];
        }
        else
            return [];
    }); };
    Parser.char = function (n) { return Parser.sat(function (x) { return n === x; }); };
    Parser.digit = function () { return Parser.sat(function (x) { return '0' <= x && x <= '9'; }); };
    Parser.lower = function () { return Parser.sat(function (x) { return 'a' <= x && x <= 'z'; }); };
    Parser.upper = function () { return Parser.sat(function (x) { return 'A' <= x && x <= 'Z'; }); };
    Parser.letter = function () { return Parser.plus(Parser.lower(), Parser.upper()); };
    Parser.alphanum = function () { return Parser.plus(Parser.letter(), Parser.digit()); };
    Parser.word = function () { return Parser.plus(Parser.bind(Parser.letter(), function (x) { return Parser.bind(Parser.word(), function (xs) { return Parser.unit(x + xs); }); }), Parser.unit("")); };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map