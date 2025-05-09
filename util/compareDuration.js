module.exports.matchesDuration = (rule, inputDuration) => {
    const match = rule.match(/(>=|<=|>|<|=)?\s*(\d+(\.\d+)?)/);
    if (!match) return false;

    const operator = match[1] || "=";
    const value = parseFloat(match[2]);
    const duration = parseFloat(inputDuration);

    switch (operator) {
        case ">": return duration > value;
        case ">=": return duration >= value;
        case "<": return duration < value;
        case "<=": return duration <= value;
        case "=": return duration === value;
        default: return false;
    }
}