const MS_PER_SEC = 1000;

var startTime = process.hrtime();

module.exports = {
    /**
     * Set the start time used for calculations in getStartEndDiffDecimal()
     * If this method is not called, the time of this object creation is used as start time
     * @param {*} startTimeNew start time in process.hrtime() format
     */
    setStartTime(startTimeNew) {
        startTime = startTimeNew;
    },

    /**
     * Returns the time passed since creation of the functionMetrics object in hrtime format
     * @param {*} startTimeNew overrides the set startTime for this difference calculation
     */
    getStartEndDiffDecimal(startTimeNew) {
        if (startTimeNew) {
            startTime = startTimeNew;
        }
        return this.convertHrTimeToMilliseconds(process.hrtime(startTime));
    },

    /**
     * Converts the hrtime format into a decimal ms format, for example the result looks like this: 15.6 ms
     * @param {*} hrtimeArray the hrtime object returned by process.hrtime(..)
     */
    convertHrTimeToMilliseconds(hrtimeArray) {
        return hrtimeArray[0] * MS_PER_SEC + Math.round(hrtimeArray[1] / 100000) / 10.0;
    }
}