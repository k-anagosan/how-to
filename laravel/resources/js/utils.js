export const OK = 200;
export const CREATED = 201;

export const UNAUTHENTICATED = 401;
export const NOT_FOUND = 404;
export const UNAUHTORIZED_CLIENT = 419;
export const UNPROCESSABLE_ENTITY = 422;

export const INTERNAL_SERVER_ERROR = 500;

export const randomStr = (len = 12) => {
    const Str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return [...Array(len)].map(() => Str[Math.floor(Math.random() * Str.length)]).join("");
};

export const hasProperty = (object, target) => {
    if (object === null) return false;
    return Object.prototype.hasOwnProperty.call(object, target);
};

export const flatten = (target, keys) => {
    const messages = keys.map(key => (hasProperty(target, key) ? target[key] : []));

    return messages.flat();
};
