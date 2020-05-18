import { Element } from "../server/element";

function areListsEqual(arr1: string[], arr2: string[]) {
    return arr1.length === arr2.length && arr2.every(i => arr1.includes(i));
}

export function getDiff(obj1: Element, obj2: Element): Partial<Element> {
    if (!obj1) {
        return obj2;
    }
    let diff = null;
    for (const key in Object.keys(obj2)) {
        if (key === 'implementedTypes' || key === 'extendedTypes') {
            if (!areListsEqual(obj1[key], obj2[key])) {
                diff = diff === null ? {} : diff;
                diff[key] = obj2[key];
            }
        }

        if (obj2[key] !== obj1[key]) {
            diff = diff === null ? {} : diff;
            diff[key] = obj2[key];
        }
    }
    return diff;

}

export function applyChanges(origin: Partial<Element>, changes: Partial<Element>): Element {
    let clone = null;
    for (const k in Object.keys(changes)) {
        if (!clone) {
            clone = { ...origin };
        }
        clone[k] = changes[k];
    }
    return clone || origin;
}