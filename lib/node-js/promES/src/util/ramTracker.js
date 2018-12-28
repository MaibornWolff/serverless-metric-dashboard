var trackedRAMArray = [];
var resourceUsageFactor = 2.5;
var intervalId;

/**
 * Utility class to track RAM over time while the application runs
 */
class RAMTracker {
    /**
     * Create a RAMTracker instance. RAMTracking is automatically started in the constructor.
     * @param {object} logger an object having a .log() function
     * @param {number} trackInterval interval in ms to track current RAM usage
     * @param {number} customResourceUsageFactor optional factor which is multiplied with the GB-second usage, default 2.5
     */
    constructor(logger, trackInterval, customResourceUsageFactor) {
        if (customResourceUsageFactor) {
            resourceUsageFactor = customResourceUsageFactor;
        }
        this.logger = logger;
        this.startRAMTracking(trackInterval);
    }

    /**
     * Starts RAM tracking with the given interval. Is automatically called in the constructor
     * @param {number} trackInterval interval in ms to track current RAM usage
     */
    startRAMTracking(trackInterval) {
        if (!trackInterval || typeof trackInterval !== 'number') {
            trackInterval = 200;
        }
        if (!intervalId) {
            intervalId = setInterval(this.trackRAM, trackInterval);
        } else {
            this.logger.log("RAMTracking was already started at some point, not starting again!");
        }
    }

    /**
     * Saves the current RAM usage (total heap: usage + reserved) rounded up to the next
     * multiple of 128MB in an array
     * 
     * This function should be called by node's setInterval()
     */
    trackRAM() {
        // save RAM as Megabytes
        var measuredRAM = process.memoryUsage().heapTotal / 1000000;
        var roundedRAM = measuredRAM + (128 - (measuredRAM % 128));
        trackedRAMArray.push(roundedRAM);
    }

    /**
     * Stops RAM tracking started with the setInterval() function using the saved
     * interval id
     */
    stopRAMTracking() {
        this.trackRAM();
        clearInterval(intervalId);
    }

    /**
     * Calculates the average RAM usage using the array created by trackRAM() and multiplies
     * it with the resourceUsageFactor
     * @param {number} executionTime 
     */
    getGigabyteSeconds(executionTime) {
        this.logger.log("Calculating Gigabyte-Seconds...");
        let sum = trackedRAMArray.reduce((previous, current) => current += previous);
        let averageRAM = sum / trackedRAMArray.length;
        this.logger.log("avg: " + averageRAM);

        var megabyteMilliSeconds = averageRAM * executionTime;
        this.logger.log("MB-ms: " + megabyteMilliSeconds);
        var gigabyteSeconds = (megabyteMilliSeconds / 1000000) * resourceUsageFactor;
        this.logger.log("GB-s: " + gigabyteSeconds);
        return gigabyteSeconds;
    }
}

module.exports = RAMTracker;