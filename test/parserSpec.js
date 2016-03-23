/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../parser.ts" />
"use strict";
var chai_1 = require("chai");
var parser_1 = require("../parser");
describe("Parser", function () {
    describe("#item", function () {
        var p = parser_1.Parser.item();
        it("should be a Parser", function () {
            chai_1.expect(p).to.be.instanceof(parser_1.Parser);
        });
        it("should consume only 1 char when input is non-empty", function () {
            chai_1.expect(p.run("test")).to.have.deep.property("0.lexeme", "t");
            chai_1.expect(p.run("test")).not.to.be.empty;
        });
        it("should return the unconsumed source", function () {
            chai_1.expect(p.run("test")).to.have.deep.property("0.source", "est");
            chai_1.expect(p.run("a")).to.have.deep.property("0.source", "");
        });
        it("should fail if input is empty", function () {
            chai_1.expect(p.run("")).to.be.empty;
        });
    });
    describe("#zero", function () {
        var p = parser_1.Parser.zero();
        it("should be a Parser", function () {
            chai_1.expect(p).to.be.instanceof(parser_1.Parser);
        });
        it("should fail on any input", function () {
            chai_1.expect(p.run("")).to.be.empty;
            chai_1.expect(p.run("a")).to.be.empty;
            chai_1.expect(p.run("ab")).to.be.empty;
            chai_1.expect(p.run("abc")).to.be.empty;
        });
    });
    describe("#unit", function () {
        it("should be a Parser", function () {
            chai_1.expect(parser_1.Parser.unit("")).to.be.instanceof(parser_1.Parser);
        });
        it("should lift any value into a Parser monad", function () {
            var result = [{ lexeme: "", source: "abc" }];
            chai_1.expect(parser_1.Parser.unit("").run("abc")).to.deep.equal(result);
            result[0].lexeme = "x";
            chai_1.expect(parser_1.Parser.unit("x").run("abc")).to.deep.equal(result);
        });
    });
    describe("#bind", function () {
        var p = parser_1.Parser.bind(parser_1.Parser.item(), function (a) {
            return parser_1.Parser.bind(parser_1.Parser.item(), function (b) {
                return parser_1.Parser.bind(parser_1.Parser.item(), function (c) {
                    return parser_1.Parser.unit(a + c);
                });
            });
        });
        it("should be a Parser", function () {
            chai_1.expect(p).to.be.instanceof(parser_1.Parser);
        });
        it("should return a lexeme that skips the second character", function () {
            var result = [{ lexeme: "ac", source: "" }];
            chai_1.expect(p.run("abc")).to.deep.equal(result);
        });
        it("should respect identity property", function () {
            chai_1.expect(parser_1.Parser.bind(parser_1.Parser.item(), parser_1.Parser.unit).run("test")).to.eql(parser_1.Parser.unit("t").run("est"));
        });
    });
    describe("#sat", function () {
        var p = parser_1.Parser.sat();
        it("should be a Parser", function () {
            chai_1.expect(p).to.be.instanceof(parser_1.Parser);
        });
        it("should pass on a positive predicate", function () {
            chai_1.expect(p.run("test")).to.not.be.empty;
        });
        it("should fail on a negative predicate", function () {
            chai_1.expect(parser_1.Parser.sat(function () { return false; }).run("test")).to.be.empty;
        });
    });
    describe("#char", function () {
        var p = parser_1.Parser.char("a");
        it("should be a Parser", function () {
            chai_1.expect(p).to.be.instanceof(parser_1.Parser);
        });
        it("should pass on a matched char", function () {
            chai_1.expect(p.run("abc")).to.not.be.empty;
        });
        it("should fail on a matched char", function () {
            chai_1.expect(p.run("cba")).to.be.empty;
        });
    });
    describe("#lower", function () {
        var p = parser_1.Parser.lower();
        var twolower = parser_1.Parser.bind(parser_1.Parser.lower(), function (x) {
            return parser_1.Parser.bind(parser_1.Parser.lower(), function (y) {
                return parser_1.Parser.unit("" + x + y);
            });
        });
        it("should be a Parser", function () {
            chai_1.expect(p).to.be.instanceof(parser_1.Parser);
            chai_1.expect(twolower).to.be.instanceof(parser_1.Parser);
        });
        it("should pass on lower case letters", function () {
            chai_1.expect(p.run("a")).to.not.be.empty;
            chai_1.expect(p.run("b")).to.not.be.empty;
            chai_1.expect(p.run("c")).to.not.be.empty;
        });
        it("should fail on upper case letters", function () {
            chai_1.expect(p.run("A")).to.be.empty;
            chai_1.expect(p.run("B")).to.be.empty;
            chai_1.expect(p.run("C")).to.be.empty;
        });
        describe("twolower custom parser", function () {
            it("should consume two lower case letters", function () {
                chai_1.expect(twolower.run("abcd")).to.have.deep.property("0.lexeme", "ab");
            });
            it("should fail consuming a lower, followed by an upper", function () {
                chai_1.expect(twolower.run("aBcd")).to.be.empty;
            });
        });
    });
    describe("#upper", function () {
        var p = parser_1.Parser.upper();
        it("should be a Parser", function () {
            chai_1.expect(p).to.be.instanceof(parser_1.Parser);
        });
        it("should pass on upper case letters", function () {
            chai_1.expect(p.run("A")).to.not.be.empty;
            chai_1.expect(p.run("B")).to.not.be.empty;
            chai_1.expect(p.run("C")).to.not.be.empty;
        });
        it("should fail on lower case letters", function () {
            chai_1.expect(p.run("a")).to.be.empty;
            chai_1.expect(p.run("b")).to.be.empty;
            chai_1.expect(p.run("c")).to.be.empty;
        });
    });
    describe("#letter", function () {
        var p = parser_1.Parser.letter();
        it("should be a Parser", function () {
            chai_1.expect(p).to.be.instanceof(parser_1.Parser);
        });
        it("should pass on a letter", function () {
            chai_1.expect(p.run("a")).to.not.be.empty;
            chai_1.expect(p.run("A")).to.not.be.empty;
        });
        it("should fail on a digit", function () {
            chai_1.expect(p.run("4")).to.be.empty;
            chai_1.expect(p.run("2")).to.be.empty;
        });
    });
    describe("#digit", function () {
        var p = parser_1.Parser.digit();
        it("should be a Parser", function () {
            chai_1.expect(p).to.be.instanceof(parser_1.Parser);
        });
        it("should pass on a digit", function () {
            chai_1.expect(p.run("4")).to.not.be.empty;
            chai_1.expect(p.run("2")).to.not.be.empty;
        });
        it("should fail on a letter", function () {
            chai_1.expect(p.run("a")).to.be.empty;
            chai_1.expect(p.run("A")).to.be.empty;
        });
    });
    describe("#plus", function () {
        var p = parser_1.Parser.plus(parser_1.Parser.letter(), parser_1.Parser.digit());
        it("should pass on letter or digit", function () {
            chai_1.expect(p.run("k")).to.not.be.empty;
            chai_1.expect(p.run("9")).to.not.be.empty;
        });
        it("should fail on special characters", function () {
            chai_1.expect(p.run("#")).to.be.empty;
            chai_1.expect(p.run("!")).to.be.empty;
        });
    });
    describe("#alphanum", function () {
        var p = parser_1.Parser.alphanum();
        it("should be a Parser", function () {
            chai_1.expect(p).to.be.instanceof(parser_1.Parser);
        });
        it("should match a letter or digit", function () {
            chai_1.expect(p.run("k")).to.not.be.empty;
            chai_1.expect(p.run("9")).to.not.be.empty;
        });
        it("should fail on special characters", function () {
            chai_1.expect(p.run("#")).to.be.empty;
            chai_1.expect(p.run("!")).to.be.empty;
        });
    });
    describe("#word", function () {
        var p = parser_1.Parser.word();
        it("should be a Parser", function () {
            chai_1.expect(p).to.be.instanceof(parser_1.Parser);
        });
        it("should match words", function () {
            chai_1.expect(p.run("Yes!")).to.have.deep.property("0.lexeme", "Yes");
        });
    });
});
//# sourceMappingURL=parserSpec.js.map