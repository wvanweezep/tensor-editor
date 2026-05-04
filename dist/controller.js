export function HTML(id, ctor) {
    return function (target, propertyKey) {
        const privateKey = Symbol(String(propertyKey));
        Object.defineProperty(target, propertyKey, {
            get() {
                if (!this[privateKey]) {
                    const element = document.getElementById(id);
                    if (!element)
                        throw new Error(`Unable to resolve HTML element with id "${id}"`);
                    if (ctor && !(element instanceof ctor))
                        throw new Error(`HTMLElement with id "${id}" is not of type "${ctor}"`);
                    this[privateKey] = element;
                }
                return this[privateKey];
            },
            set(value) {
                this[privateKey] = value;
            }
        });
    };
}
const eventMap = new WeakMap();
export function OnEvent(type, selector) {
    return function (target, propertyKey) {
        var _a;
        const events = (_a = eventMap.get(target)) !== null && _a !== void 0 ? _a : [];
        events.push({ type, selector, methodSym: propertyKey });
        eventMap.set(target, events);
    };
}
// TODO: Add a way to unbind by storing the listener
export class Controller {
    constructor() {
        this.bindEvents(this);
    }
    bindEvents(instance) {
        var _a;
        const events = (_a = eventMap.get(Object.getPrototypeOf(instance))) !== null && _a !== void 0 ? _a : [];
        for (const { type, selector, methodSym } of events) {
            document.querySelectorAll(selector).forEach(element => element.addEventListener(type, (e) => instance[methodSym].call(instance, e, element)));
        }
    }
}
