const { exec } = require('child_process');
const net = require('net');

const FUNCTION_APP = 'rb-image-processor-durable';
const AGGREGATOR_PORT = 8191;
const AGGREGATOR_HOSTNAME = 'localhost';
const SUBSCRIPTION_ID = "<your-id-here>";

var currentTime = new Date();
console.log(currentTime.toISOString().replace(/\..+/, '') + 'Z');

var startTime = new Date(currentTime - 60000 * 2);
var endTime = new Date(currentTime - 60000);

var commandString = 'az monitor metrics list' +
    ' --resource /subscriptions/' + SUBSCRIPTION_ID +'/resourceGroups/' +
    'ServerlessExample/providers/Microsoft.Web/sites/' + FUNCTION_APP +
    ' --metric FunctionExecutionUnits --aggregation Total --interval PT1M' +
    ' --start-time ' + startTime.toISOString().replace(/\..+/, '') + 'Z' + ' --end-time ' +
    endTime.toISOString().replace(/\..+/, '') + 'Z';

exec(commandString, (err, stdout, stderr) => {
    if (err) {
        console.log(err);
        return;
    }

    var response = JSON.parse(stdout);

    var usedMBMilliSeconds = response.value[0].timeseries[0].data[0].total;
    console.log(usedMBMilliSeconds);
    if (usedMBMilliSeconds == 0) {
        console.log('No new used resources, skipping sending to aggregator');
        return;
    }

    var usedGBSeconds = usedMBMilliSeconds / 1024000;
    console.log(usedGBSeconds);

    var aggregatorSocket = net.Socket();
    aggregatorSocket.connect(AGGREGATOR_PORT, AGGREGATOR_HOSTNAME);

    aggregatorSocket.on('data', function (d) {
        console.log(d.toString());
    });

    aggregatorSocket.write(
        'azure_monitor_gigabyteseconds_total{function_app="' + FUNCTION_APP + '"} ' + usedGBSeconds);

    aggregatorSocket.end();

    // the *entire* stdout and stderr (buffered)
    //console.log(`stdout: ${stdout}`);
    //console.log(`stderr: ${stderr}`);
});