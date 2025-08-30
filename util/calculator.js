function filterReturns(data, duration, wf) {
    const dur = duration ? Number(duration) : null;
    return data.filter(row => {
        // Filter by withdrawal frequency (if provided)
        if (wf) {
            if (
                row.ri_wf &&
                row.ri_wf.toLowerCase() !== "any" &&
                row.ri_wf.toLowerCase() !== wf.toLowerCase()
            ) {
                return false;
            }
        }

        // Filter by duration
        if (dur !== null) {
            const dbDuration = row.ri_duration;

            if (dbDuration === "1" && dur !== 1) return false;
            if (dbDuration === ">1" && dur <= 1) return false;
            if (dbDuration.startsWith(">") && dur <= parseFloat(dbDuration.slice(1))) return false;
            if (dbDuration.startsWith(">=") && dur < parseFloat(dbDuration.slice(2))) return false;
            if (!isNaN(dbDuration) && Number(dbDuration) !== dur) return false;
        }

        return true;
    });
}

module.exports = { filterReturns }