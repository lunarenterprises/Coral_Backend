function filterReturns(data, duration, wf) {
    return data.filter(row => {
        // Filter by withdrawal frequency (if provided)
        if (wf) {
            if (
                row.ri_wf &&
                row.ri_wf.toLowerCase() !== "any" && // "Any" matches everything
                row.ri_wf.toLowerCase() !== wf.toLowerCase()
            ) {
                return false;
            }
        }

        // Filter by duration
        if (duration) {
            const dbDuration = row.ri_duration;

            if (dbDuration === "1" && duration !== 1) return false;
            if (dbDuration === ">1" && duration <= 1) return false;
            if (dbDuration.startsWith(">") && duration <= parseFloat(dbDuration.slice(1))) return false;
            if (dbDuration.startsWith(">=") && duration < parseFloat(dbDuration.slice(2))) return false;
            if (!isNaN(dbDuration) && Number(dbDuration) !== duration) return false;
        }

        return true;
    });
}

module.exports = { filterReturns }