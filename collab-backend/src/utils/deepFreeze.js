const deepFreeze = (ob) => {
    for (const key in ob) {
        const value = ob[key];

        if (value && typeof value == "object") {
            deepFreeze(value);
        }
    }

    return Object.freeze(ob);
};

export default deepFreeze;
