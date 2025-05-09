function convertToNumber(val, defaultMultiplier = 1, forceMultiplier = false) {
    if (!val) return null;
    val = val.toString().trim().toLowerCase();

    if (val.endsWith('k')) return Number(val.replace('k', '')) * 1000;
    if (val.endsWith('m')) return Number(val.replace('m', '')) * 1000000;
    if (val.includes('million')) return Number(val.replace(/[^0-9.]/g, '')) * 1000000;

    // Only apply default multiplier if explicitly forced or number looks small
    const num = Number(val);
    if (forceMultiplier || (defaultMultiplier > 1 && num < 10000)) {
        return num * defaultMultiplier;
    }

    return num;
}

module.exports.parseAmount = (value) => {
    if (!value) return null;

    value = value.toString().trim().toLowerCase();

    // Above X: strict greater than
    if (value.includes('above')) {
        const num = value.match(/\d+(\.\d+)?/);
        let numText = num?.[0] || '0';

        // Determine multiplier
        let multiplier = 1;
        if (value.includes('k')) multiplier = 1000;
        else if (value.includes('m') || value.includes('million')) multiplier = 1000000;

        const base = Number(numText) * multiplier;
        return { from: base + 1, to: null };
    }

    if (value.includes('-')) {
        let [fromStr, toStr] = value.split('-').map(v => v.trim().toLowerCase());

        let multiplier = 1;
        if (toStr.endsWith('k')) multiplier = 1000;
        else if (toStr.endsWith('m')) multiplier = 1000000;
        else if (toStr.includes('million')) multiplier = 1000000;

        return {
            from: convertToNumber(fromStr, multiplier),
            to: convertToNumber(toStr)
        };
    }

    const num = convertToNumber(value);
    return { from: num, to: null };
};
