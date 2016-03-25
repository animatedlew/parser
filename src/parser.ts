/// <reference path="interfaces.ts" />
import { Result, LiftParser, Predicate } from "./interfaces";

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
    static bind<T>(p: Parser<T>, f: LiftParser<T>): Parser<T> {
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
        return Parser.bind(
            Parser.item(),
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
        Parser.bind(
            Parser.letter(),
            x => Parser.bind(
                Parser.word(),
                xs => Parser.unit(x + xs)
            )
        ),
        Parser.unit("")
    );
    static string = (input: string): Parser<string> => {
        let [head, ...tail] = input.split("");
        return Parser.plus(
            Parser.bind(
                Parser.char(head),
                x => Parser.bind(
                    Parser.string(tail.join("")),
                    xs => Parser.unit(x + xs)
                )
            ),
            Parser.unit("")
        );
    }
    static many(p: Parser<string>): Parser<string> {
        return Parser.plus(Parser.bind(p, x => Parser.bind(Parser.many(p), xs => Parser.unit(x + xs))), Parser.unit(""));
    }
    apply = (input: string): Result<T>[] => this.f(input);
}
