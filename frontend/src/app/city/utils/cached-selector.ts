const cache = new Map<string, Map<string, any>>();

export function createCachedSelector<T>(name: string, selector: T, ...args: any[]): T {
    const argsString = args.map(a => a.toString()).join('.');
    if (!cache.has(name)) {
        cache.set(name, new Map<string, any>());
    }
    const selectorCache = cache.get(name);
    if (!selectorCache.has(argsString)) {
        selectorCache.set(argsString, selector);
    }
    return <T>(selectorCache.get(argsString));
}