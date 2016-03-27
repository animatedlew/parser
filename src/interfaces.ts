/// <reference path="parser.ts" />
import Parser from "./parser";

export interface Result<T> {
    lexeme: T;
    source: string;
}

export interface TypeIdentity<T> {
    (input: T): T
}

export interface LiftParser<A, B> {
    (input: A): Parser<B>
}

export interface Predicate<T> {
    (input: T): boolean
}

export function identity<T>(n: T): T { return n; }