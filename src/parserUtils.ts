export function toInt(input: string) {
    return input.split("")
        .map(n => n.charCodeAt(0) - "0".charCodeAt(0))
        .reduce((m, n) => 10 * m + n);
}

export function head<T>(xs: T[]): T { return xs[0]; }
