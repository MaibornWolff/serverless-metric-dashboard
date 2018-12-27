const dgram = require('dgram');

var connectionError = false;

class UDPSender {
    constructor(aggregatorUrl, logger) {
        this.aggregatorUrl = aggregatorUrl;
        try {
            this.logger = logger;
        } catch (err) {
            this.logger.log(error);
            connectionError = true;
        }
    }

    sendMetric(content) {
        if (connectionError) {
            this.logger.log('Skipping sending UDP message with content: ' + content + " because of an error occurred at some point before");
            return;
        }
        var socket = dgram.createSocket('udp4');
        var message = new Buffer(content + '\n');
        socket.send(message, 0, message.length, this.aggregatorUrl.port, this.aggregatorUrl.hostname, function(err, bytes) {
            if (err) {
                this.logger.log("Error while sending udp message with content: " + content);
            }
            socket.close();
        });
    }

    /**
     * Does nothing
     */
    closeConnection() {
        // dummy
    }
}

module.exports = UDPSender;