/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/chai/chai.d.ts" />
/// <reference path="../parser.ts" />
"use strict";
var chai = require("chai");
var parser = require("../parser");
var expect = chai.expect;
var Parser = parser.Parser;
describe("Parser", function () {
    describe("#item", function () {
        var p = Parser.item();
        it("should be a Parser", function () {
            expect(p).to.be.instanceof(Parser);
        });
        it("should consume only 1 char when input is non-empty", function () {
            expect(p.run("test")).to.have.deep.property("0.lexeme", "t");
            expect(p.run("test")).not.to.be.empty;
        });
        it("should return the unconsumed source", function () {
            expect(p.run("test")).to.have.deep.property("0.source", "est");
            expect(p.run("a")).to.have.deep.property("0.source", "");
        });
        it("should fail if input is empty", function () {
            expect(p.run("")).to.be.empty;
        });
    });
    describe("#zero", function () {
        var p = Parser.zero();
        it("should be a Parser", function () {
            expect(p).to.be.instanceof(Parser);
        });
        it("should fail on any input", function () {
            expect(p.run("")).to.be.empty;
            expect(p.run("a")).to.be.empty;
            expect(p.run("ab")).to.be.empty;
            expect(p.run("abc")).to.be.empty;
        });
    });
    describe("#unit", function () {
        it("should be a Parser", function () {
            expect(Parser.unit("")).to.be.instanceof(Parser);
        });
        it("should lift any value into a Parser monad", function () {
            var result = [{ lexeme: "", source: "abc" }];
            expect(Parser.unit("").run("abc")).to.deep.equal(result);
            result[0].lexeme = "x";
            expect(Parser.unit("x").run("abc")).to.deep.equal(result);
        });
    });
    describe("#bind", function () {
        var p = Parser.bind(Parser.item(), function (a) {
            return Parser.bind(Parser.item(), function (b) {
                return Parser.bind(Parser.item(), function (c) {
                    return Parser.unit(a + c);
                });
            });
        });
        it("should be a Parser", function () {
            expect(p).to.be.instanceof(Parser);
        });
        it("should return a lexeme that skips the second character", function () {
            var result = [{ lexeme: "ac", source: "" }];
            expect(p.run("abc")).to.deep.equal(result);
        });
        it("should respect identity property", function () {
            expect(Parser.bind(Parser.item(), Parser.unit).run("test")).to.eql(Parser.unit("t").run("est"));
        });
    });
    describe("#sat", function () {
        var p = Parser.sat();
        it("should be a Parser", function () {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on a positive predicate", function () {
            expect(p.run("test")).to.not.be.empty;
        });
        it("should fail on a negative predicate", function () {
            expect(Parser.sat(function () { return false; }).run("test")).to.be.empty;
        });
    });
    describe("#char", function () {
        var p = Parser.char("a");
        it("should be a Parser", function () {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on a matched char", function () {
            expect(p.run("abc")).to.not.be.empty;
        });
        it("should fail on a matched char", function () {
            expect(p.run("cba")).to.be.empty;
        });
    });
    describe("#lower", function () {
        var p = Parser.lower();
        var twolower = Parser.bind(Parser.lower(), function (x) {
            return Parser.bind(Parser.lower(), function (y) {
                return Parser.unit("" + x + y);
            });
        });
        it("should be a Parser", function () {
            expect(p).to.be.instanceof(Parser);
            expect(twolower).to.be.instanceof(Parser);
        });
        it("should pass on lower case letters", function () {
            expect(p.run("a")).to.not.be.empty;
            expect(p.run("b")).to.not.be.empty;
            expect(p.run("c")).to.not.be.empty;
        });
        it("should fail on upper case letters", function () {
            expect(p.run("A")).to.be.empty;
            expect(p.run("B")).to.be.empty;
            expect(p.run("C")).to.be.empty;
        });
        describe("twolower custom parser", function () {
            it("should consume two lower case letters", function () {
                expect(twolower.run("abcd")).to.have.deep.property("0.lexeme", "ab");
            });
            it("should fail consuming a lower, followed by an upper", function () {
                expect(twolower.run("aBcd")).to.be.empty;
            });
        });
    });
    describe("#upper", function () {
        var p = Parser.upper();
        it("should be a Parser", function () {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on upper case letters", function () {
            expect(p.run("A")).to.not.be.empty;
            expect(p.run("B")).to.not.be.empty;
            expect(p.run("C")).to.not.be.empty;
        });
        it("should fail on lower case letters", function () {
            expect(p.run("a")).to.be.empty;
            expect(p.run("b")).to.be.empty;
            expect(p.run("c")).to.be.empty;
        });
    });
    describe("#letter", function () {
        var p = Parser.letter();
        it("should be a Parser", function () {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on a letter", function () {
            expect(p.run("a")).to.not.be.empty;
            expect(p.run("A")).to.not.be.empty;
        });
        it("should fail on a digit", function () {
            expect(p.run("4")).to.be.empty;
            expect(p.run("2")).to.be.empty;
        });
    });
    describe("#digit", function () {
        var p = Parser.digit();
        it("should be a Parser", function () {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on a digit", function () {
            expect(p.run("4")).to.not.be.empty;
            expect(p.run("2")).to.not.be.empty;
        });
        it("should fail on a letter", function () {
            expect(p.run("a")).to.be.empty;
            expect(p.run("A")).to.be.empty;
        });
    });
    describe("#plus", function () {
        var p = Parser.plus(Parser.letter(), Parser.digit());
        it("should pass on letter or digit", function () {
            expect(p.run("k")).to.not.be.empty;
            expect(p.run("9")).to.not.be.empty;
        });
        it("should fail on special characters", function () {
            expect(p.run("#")).to.be.empty;
            expect(p.run("!")).to.be.empty;
        });
    });
    describe("#alphanum", function () {
        var p = Parser.alphanum();
        it("should be a Parser", function () {
            expect(p).to.be.instanceof(Parser);
        });
        it("should match a letter or digit", function () {
            expect(p.run("k")).to.not.be.empty;
            expect(p.run("9")).to.not.be.empty;
        });
        it("should fail on special characters", function () {
            expect(p.run("#")).to.be.empty;
            expect(p.run("!")).to.be.empty;
        });
    });
    describe("#word", function () {
        var p = Parser.word();
        it("should be a Parser", function () {
            expect(p).to.be.instanceof(Parser);
        });
        it("should match words", function () {
            expect(p.run("Yes!")).to.have.deep.property("0.lexeme", "Yes");
        });
    });
});
//# sourceMappingURL=parserSpec.js.map