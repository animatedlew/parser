/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/parser.ts" />

import { expect } from "chai";
import Parser from "../src/parser";

describe("Parser", () => {    
    describe("#item", () => {
        let p = Parser.item();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should consume only 1 char when input is non-empty", () => {
            expect(p.apply("test")).to.have.deep.property("0.lexeme", "t");
            expect(p.apply("test")).not.to.be.empty;
        });
        it("should return the unconsumed source", () => {
            expect(p.apply("test")).to.have.deep.property("0.source", "est");
            expect(p.apply("a")).to.have.deep.property("0.source", "");
        });
        it("should fail if input is empty", () => {
            expect(p.apply("")).to.be.empty;
        });
    });
    describe("#zero", () => {
        let p = Parser.zero();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should fail on any input", () => {
            expect(p.apply("")).to.be.empty;
            expect(p.apply("a")).to.be.empty;
            expect(p.apply("ab")).to.be.empty;
            expect(p.apply("abc")).to.be.empty; 
        });        
    });
    describe("#unit", () => {
        it("should be a Parser", () => {
            expect(Parser.unit("")).to.be.instanceof(Parser);
        });
        it("should lift any value into a Parser monad", () => {
            let result = [{ lexeme: "", source: "abc"}];
            expect(Parser.unit("").apply("abc")).to.deep.equal(result);
            result[0].lexeme = "x";
            expect(Parser.unit("x").apply("abc")).to.deep.equal(result);
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
            expect(p.apply("abc")).to.deep.equal(result);
        });
        it("should respect identity property", () => {
            expect(Parser.bind(Parser.item(), Parser.unit).apply("test")).to.eql(Parser.unit("t").apply("est"))
        });
    });
    describe("#sat", () => {
        let p = Parser.sat();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on a positive predicate", () => {
            expect(p.apply("test")).to.not.be.empty;
        });
        it("should fail on a negative predicate", () => {
            expect(Parser.sat(() => false).apply("test")).to.be.empty;
        });
    });
    describe("#char", () => {
        let p = Parser.char("a");
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on a matched char", () => {
            expect(p.apply("abc")).to.not.be.empty;
        });
        it("should fail on a matched char", () => {
            expect(p.apply("cba")).to.be.empty;
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
            expect(p.apply("a")).to.not.be.empty;
            expect(p.apply("b")).to.not.be.empty;
            expect(p.apply("c")).to.not.be.empty;
        });
        it("should fail on upper case letters", () => {
            expect(p.apply("A")).to.be.empty;
            expect(p.apply("B")).to.be.empty;
            expect(p.apply("C")).to.be.empty;            
        });
        describe("twolower custom parser", () => {
            it("should consume two lower case letters", () => {
                expect(twolower.apply("abcd")).to.have.deep.property("0.lexeme", "ab");
            });
            it("should fail consuming a lower, followed by an upper", () => {
                expect(twolower.apply("aBcd")).to.be.empty;
            });            
        });
    });
    describe("#upper", () => {
        let p = Parser.upper();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on upper case letters", () => {
            expect(p.apply("A")).to.not.be.empty;
            expect(p.apply("B")).to.not.be.empty;
            expect(p.apply("C")).to.not.be.empty;
        });
        it("should fail on lower case letters", () => {
            expect(p.apply("a")).to.be.empty;
            expect(p.apply("b")).to.be.empty;
            expect(p.apply("c")).to.be.empty;            
        });
    });
    describe("#letter", () => {
        let p = Parser.letter();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on a letter", () => {
            expect(p.apply("a")).to.not.be.empty;
            expect(p.apply("A")).to.not.be.empty;
        });
        it("should fail on a digit", () => {
            expect(p.apply("4")).to.be.empty;
            expect(p.apply("2")).to.be.empty;
        });
    });
    describe("#digit", () => {
        let p = Parser.digit();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should pass on a digit", () => {
            expect(p.apply("4")).to.not.be.empty;
            expect(p.apply("2")).to.not.be.empty;
        });
        it("should fail on a letter", () => {
            expect(p.apply("a")).to.be.empty;
            expect(p.apply("A")).to.be.empty;
        });
    });
    describe("#plus", () => {
        let p = Parser.plus(Parser.letter(), Parser.digit());
        it("should pass on letter or digit", () => {
            expect(p.apply("k")).to.not.be.empty
            expect(p.apply("9")).to.not.be.empty
        });
        it("should fail on special characters", () => {
            expect(p.apply("#")).to.be.empty
            expect(p.apply("!")).to.be.empty
        });
    });
    describe("#alphanum", () => {
        let p = Parser.alphanum();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should match a letter or digit", () => {
            expect(p.apply("k")).to.not.be.empty
            expect(p.apply("9")).to.not.be.empty
        });
        it("should fail on special characters", () => {
            expect(p.apply("#")).to.be.empty
            expect(p.apply("!")).to.be.empty
        });
    });
    describe("#word", () => {
        let p = Parser.word();
        it("should be a Parser", () => {
            expect(p).to.be.instanceof(Parser);
        });
        it("should match up to non-letter", () => {
            expect(p.apply("Yes!")).to.have.deep.property("0.lexeme", "Yes");
        });
        it("should match words", () => {
            let phrase = "What did the fox say?";
            expect(
                Parser.bind(
                    Parser.word(),
                    a => Parser.bind(
                        Parser.word(),
                        b => Parser.bind(
                            Parser.word(),
                            c => Parser.unit(`${a}${b}${c}`)
                        )
                    )
                ).apply(phrase)
            ).to.have.deep.property("0.lexeme", "What");
        });
    });
    describe("#string", () => {
       it("should be a Parser", () => {
           expect(Parser.string("")).to.be.instanceof(Parser);
       });
       it("should match specific strings", () => {
            let phrase = "dog";
            expect(Parser.string(phrase).apply("fox")).to.have.deep.property("0.lexeme", "");
            expect(Parser.string(phrase).apply("dog")).to.have.deep.property("0.lexeme", "dog");
        });
    });
});
