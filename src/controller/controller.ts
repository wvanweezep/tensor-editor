
export function HTML(id: string): PropertyDecorator
export function HTML<T extends HTMLElement>(id: string, ctor: new (...args: any[]) => T): PropertyDecorator

export function HTML<T extends HTMLElement>(id: string, ctor?: any): PropertyDecorator {
    return function(target: Object, propertyKey: string | symbol) {
        const privateKey = Symbol(String(propertyKey));
        Object.defineProperty(target, propertyKey, {
            get(): T {
                if (!this[privateKey]) {
                    const element = document.getElementById(id);
                    if (!element) throw new Error(
                        `Unable to resolve HTML element with id "${id}"`);
                    if (ctor && !(element instanceof ctor)) throw new Error(
                        `HTMLElement with id "${id}" is not of type "${ctor}"`);
                    this[privateKey] = element;
                } return this[privateKey]
            },
            set(value: T): void {
                this[privateKey] = value;
            }
        })
    }
}

type EventMeta = {
    type: string;
    selector: string;
    methodSym: string | symbol;
};

const eventMap = new WeakMap<any, EventMeta[]>();
export function OnEvent(type: string, selector: string): MethodDecorator {
    return function(target: Object, propertyKey: string | symbol) {
        const events = eventMap.get(target) ?? [];
        events.push({type, selector, methodSym: propertyKey});
        eventMap.set(target, events);
    }
}

// TODO: Add a way to unbind by storing the listener

export abstract class Controller {
    public constructor() {
        this.bindEvents(this);
    }

    public bindEvents(instance: any): void {
        const events = eventMap.get(Object.getPrototypeOf(instance)) ?? [];
        for (const {type, selector, methodSym} of events) {
            document.querySelectorAll(selector).forEach(element =>
                element.addEventListener(type, (e: Event) =>
                    instance[methodSym].call(instance, e, element)));
        }
    }
}
