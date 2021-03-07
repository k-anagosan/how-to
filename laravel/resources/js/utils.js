export const randomStr = () => {
    const [MaxLength, radix] = [-12, 36];
    const length = Math.floor(Math.random() * MaxLength);
    return Math.random().toString(radix).slice(length);
};
