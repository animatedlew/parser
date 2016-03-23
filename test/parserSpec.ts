/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../parser.ts" />

import chai = require("chai");
import parser = require("../parser");
let expect = chai.expect;
let Parser = parser.Parser; 

describe("Parser", () => {    
    describe("#item", () => {
        let p = Parser.item();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should consume only 1 char when input is non-empty", () => {
            expect(p.run("test")).to.have.deep.property("0.lexeme", "t");
            expect(p.run("test")).not.to.be.empty;
        });
        it("should return the unconsumed source", () => {
            expect(p.run("test")).to.have.deep.property("0.source", "est");
            expect(p.run("a")).to.have.deep.property("0.source", "");
        });
        it("should fail if input is empty", () => {
            expect(p.run("")).to.be.empty;
        });
    });
    describe("#zero", () => {
        let p = Parser.zero();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should fail on any input", () => {
            expect(p.run("")).to.be.empty;
            expect(p.run("a")).to.be.empty;
            expect(p.run("ab")).to.be.empty;
            expect(p.run("abc")).to.be.empty; 
        });        
    });
    describe("#unit", () => {
        it("should be a Parser", () => {
            expect(Parser.unit("")).to.be.instanceof(Parser);
        });
        it("should lift any value into a Parser monad", () => {
            let result = [{ lexeme: "", source: "abc"}];
            expect(Parser.unit("").run("abc")).to.deep.equal(result);
            result[0].lexeme = "x";
            expect(Parser.unit("x").run("abc")).to.deep.equal(result);
        });        
    });
    describe("#bind", () => {
        let p = Parser.bind(Parser.item(), a => {
                return Parser.bind(Parser.item(), b => {
                    return Parser.bind(Parser.item(), c => {
                        return Parser.unit(a + c);
                    });
                });
            });
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should return a lexeme that skips the second character", () => {
            let result = [{ lexeme: "ac", source: ""}];
            expect(p.run("abc")).to.deep.equal(result);
        });
        it("should respect identity property", () => {
            expect(Parser.bind(Parser.item(), Parser.unit).run("test")).to.eql(Parser.unit("t").run("est"))
        });
    });
    describe("#sat", () => {
        let p = Parser.sat();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on a positive predicate", () => {
            expect(p.run("test")).to.not.be.empty;
        });
        it("should fail on a negative predicate", () => {
            expect(Parser.sat(() => false).run("test")).to.be.empty;
        });
    });
    describe("#char", () => {
        let p = Parser.char("a");
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on a matched char", () => {
            expect(p.run("abc")).to.not.be.empty;
        });
        it("should fail on a matched char", () => {
            expect(p.run("cba")).to.be.empty;
        });
    });
    describe("#lower", () => {
        let p = Parser.lower();
        let twolower = Parser.bind(Parser.lower(), x => {
            return Parser.bind(Parser.lower(), y => {
                return Parser.unit(`${x}${y}`);
            });
        });
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
            expect(twolower).to.be.instanceof(Parser);
        });
        it("should pass on lower case letters", () => {
            expect(p.run("a")).to.not.be.empty;
            expect(p.run("b")).to.not.be.empty;
            expect(p.run("c")).to.not.be.empty;
        });
        it("should fail on upper case letters", () => {
            expect(p.run("A")).to.be.empty;
            expect(p.run("B")).to.be.empty;
            expect(p.run("C")).to.be.empty;            
        });
        describe("twolower custom parser", () => {
            it("should consume two lower case letters", () => {
                expect(twolower.run("abcd")).to.have.deep.property("0.lexeme", "ab");
            });
            it("should fail consuming a lower, followed by an upper", () => {
                expect(twolower.run("aBcd")).to.be.empty;
            });            
        });
    });
    describe("#upper", () => {
        let p = Parser.upper();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on upper case letters", () => {
            expect(p.run("A")).to.not.be.empty;
            expect(p.run("B")).to.not.be.empty;
            expect(p.run("C")).to.not.be.empty;
        });
        it("should fail on lower case letters", () => {
            expect(p.run("a")).to.be.empty;
            expect(p.run("b")).to.be.empty;
            expect(p.run("c")).to.be.empty;            
        });
    });
    describe("#letter", () => {
        let p = Parser.letter();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on a letter", () => {
            expect(p.run("a")).to.not.be.empty;
            expect(p.run("A")).to.not.be.empty;
        });
        it("should fail on a digit", () => {
            expect(p.run("4")).to.be.empty;
            expect(p.run("2")).to.be.empty;
        });
    });
    describe("#digit", () => {
        let p = Parser.digit();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on a digit", () => {
            expect(p.run("4")).to.not.be.empty;
            expect(p.run("2")).to.not.be.empty;
        });
        it("should fail on a letter", () => {
            expect(p.run("a")).to.be.empty;
            expect(p.run("A")).to.be.empty;
        });
    });
    describe("#plus", () => {
        let p = Parser.plus(Parser.letter(), Parser.digit());
        it("should pass on letter or digit", () => {
            expect(p.run("k")).to.not.be.empty
            expect(p.run("9")).to.not.be.empty
        });
        it("should fail on special characters", () => {
            expect(p.run("#")).to.be.empty
            expect(p.run("!")).to.be.empty
        });
    });
    describe("#alphanum", () => {
        let p = Parser.alphanum();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should match a letter or digit", () => {
            expect(p.run("k")).to.not.be.empty
            expect(p.run("9")).to.not.be.empty
        });
        it("should fail on special characters", () => {
            expect(p.run("#")).to.be.empty
            expect(p.run("!")).to.be.empty
        });
    });
    describe("#word", () => {
        let p = Parser.word();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should match words", () => {
            expect(p.run("Yes!")).to.have.deep.property("0.lexeme", "Yes");
        });
    });
});
