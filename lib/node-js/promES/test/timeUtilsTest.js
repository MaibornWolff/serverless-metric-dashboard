const assert = require('assert');
var timeUtils = require('../src/util/timeUtils');

describe('timeUtils', function () {
    const testTime = [116232, 401781164];
    describe('#getStartEndDiffDecimal() without startTime', function () {
        it('should return a value > 0', function () {
            assert(timeUtils.getStartEndDiffDecimal() > 0);
        });
    });
    timeUtils = require('../src/util/timeUtils');
    describe('#convertHrTimeToMilliseconds(time)', function () {
        it('Should return the calculated value 116232401.8', function () {
            assert.strictEqual(timeUtils.convertHrTimeToMilliseconds(testTime), 116232401.8);
        });
    });
});