/// <reference path="interfaces.ts" />
import { Result, LiftParser, Predicate } from "./interfaces";

let toInt = (input: string) => input.split("")
    .map(n => n.charCodeAt(0) - "0".charCodeAt(0))
    .reduce((m, n) => 10 * m + n);
    
export default class Parser<T> {
    constructor(private f: (input: string) => Result<T>[]) {}
    static zero<T>(): Parser<T> {
        return new Parser((input: string): Result<T>[] => []);
    }
    // a -> m a
    static unit<T>(v: T) {
        return new Parser((input: string): Result<T>[] => [{ lexeme: v, source: input }]);
    }
    // m a -> (a -> m b) -> m b
    static bind<A, B>(p: Parser<A>, f: LiftParser<A, B>): Parser<B> {
        return new Parser((input: string) => {
            // apply f to the lexeme while applying this.f on the source
            let result = p.apply(input).map(o => f(o.lexeme).apply(o.source));
            return result.reduce((b, a) => b.concat(a), []); // flatten
        });
    }
    static plus<T>(p1: Parser<T>, p2: Parser<T>): Parser<T> {
        return new Parser((input: string) => p1.apply(input).concat(p2.apply(input)));
    }
    static item = () => new Parser((input: string) => {
            if (input.length) {
                let [head, ...tail] = input.split("");
                return [{ lexeme: head, source: tail.join("") }];
            } else return [];
        });
    static sat(p: Predicate<string> = (s: string) => true) {
        return Parser.bind(Parser.item(),
            x => p(x) ? Parser.unit(x) : Parser.zero<string>()
        ); 
    }
    static char = (n: string) => Parser.sat(x => n === x);
    static digit = () => Parser.sat(x => '0' <= x && x <= '9');
    static lower = () => Parser.sat(x => 'a' <= x && x <= 'z');
    static upper = () => Parser.sat(x => 'A' <= x && x <= 'Z');
    static letter = () => Parser.plus(Parser.lower(), Parser.upper());
    static alphanum = () => Parser.plus(Parser.letter(), Parser.digit());
    static word = (): Parser<string> => Parser.plus(
        Parser.bind(Parser.letter(),
        x  => Parser.bind(Parser.word(),
        xs => Parser.unit(x + xs))),
        Parser.unit("")
    );
    static string = (input: string): Parser<string> => {
        let [head, ...tail] = input.split("");
        return Parser.plus(
            Parser.bind(Parser.char(head),
            x  => Parser.bind(Parser.string(tail.join("")),
            xs => Parser.unit(x + xs))),
            Parser.unit("")
        );
    }
    static ident(): Parser<string> {
        return new Parser((input: string) => {
            return Parser.bind(Parser.letter(),
                x  => Parser.bind(Parser.many(Parser.alphanum()),
                xs => Parser.unit( xs.concat([x]).reverse().join("") )
                )).apply(input);
        });
    }
    static many<T>(p: Parser<T>): Parser<T[]> {
        return Parser.plus(Parser.bind(p,
            x  => Parser.bind(Parser.many(p),
            xs => Parser.unit(xs.concat([x])))),
            Parser.unit([]));
    }
    static many1<T>(p: Parser<T>): Parser<T[]> {
        return Parser.bind(p, 
            x  => Parser.bind(Parser.many(p),
            xs => Parser.unit(xs.concat([x])))
        );
    }
    static nat(): Parser<number> {
        return Parser.bind(Parser.many1(Parser.digit()),
            xs => Parser.unit(toInt(xs.reverse().join("")))
        );
    }
    static int(): Parser<number> {
        return Parser.plus(
            Parser.bind(Parser.char("-"),
            _ => Parser.bind(Parser.nat(),
            n => Parser.unit(-n))),
            Parser.nat());
    }
    static ints() {
        let rep = Parser.many(Parser.bind(Parser.char(","),
            _ => Parser.bind(Parser.alphanum(), // change to Parser.int()
            x => Parser.unit(x))));
        return Parser.bind(Parser.char("["),
            _  => Parser.bind(Parser.alphanum(), // change to Parser.int()
            n  => Parser.bind(rep,
            ns => Parser.bind(Parser.char("]"),
            _  => Parser.unit(  ns.concat([n]).reverse()  )))));
    }
    apply = (input: string): Result<T>[] => this.f(input);
}
