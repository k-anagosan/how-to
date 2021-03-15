export const OK = 200;
export const CREATED = 201;

export const NOT_FOUND = 404;
export const UNAUHTORIZED_CLIENT = 419;
export const UNPROCESSABLE_ENTITY = 422;

export const INTERNAL_SERVER_ERROR = 500;

export const randomStr = () => {
    const [MaxLength, radix] = [-12, 36];
    const length = Math.floor(Math.random() * MaxLength);
    return Math.random().toString(radix).slice(length);
};
