const cache = new Map<string, Map<string, any>>();

export function Cached(selectorName: string): MethodDecorator {
    return (target: any, propertyKey, descriptor: any) => {
        const originalMethod = descriptor.value;

        descriptor.value = function(...args: any[]) {
            const selectorKey = `${selectorName};${args.map(a => a.toString()).join(';')}`;
            if (!cache.has(selectorKey)) {
                cache.set(selectorKey, originalMethod.apply(this, arguments));
            }
            return cache.get(selectorKey);
        };
    };
}