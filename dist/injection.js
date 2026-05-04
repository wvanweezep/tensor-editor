export function HTML(id, ctor) {
    return function (target, propertyKey) {
        const privateKey = Symbol(String(propertyKey));
        Object.defineProperty(target, propertyKey, {
            get() {
                if (!this[privateKey]) {
                    const element = document.getElementById(id);
                    if (!element)
                        throw new Error(`Unable to resolve HTML element with id ${id}`);
                    if (ctor && !(element instanceof ctor))
                        throw new Error(`Found HTMLElement is not of type ${ctor}`);
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
export function OnEvent(type, func) {
    return function (target, propertyKey) {
    };
}
