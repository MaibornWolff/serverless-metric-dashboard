const net = require('net');

var connectionError = undefined;

class TCPSender {
    /**
     * Opens a TCP Socket and connects to the given aggregatorUrl
     */
    constructor(aggregatorUrl, logger) {
        this.logger = logger;
        try {
            this.aggregatorSocket = net.Socket();
            this.aggregatorSocket.connect(aggregatorUrl.port, aggregatorUrl.hostname);

            this.aggregatorSocket.on('data', function (d) {
                this.logger.log(d.toString());
            });

            this.isClosed = false;
        } catch (err) {
            connectionError = err;
            this.logger.log("An error occurred while trying to connect or send to the prometheus aggregator on: " + aggregatorUrl.hostname + ":" + aggregatorUrl.port);
            this.logger.log("Disabling metrics for this session");
            this.aggregatorSocket = undefined;
            this.logger.log(err);
        }
    }

    /**
     * Sends metric and adds new line behind content
     * @param {string} content the content to be sent
     */
    sendMetric(content) {
        if (connectionError) {
            this.logger.log('Skipping sending TCP message with content: ' + content + " because of an error occurred at some point before");
            return;
        }
        if (this.isClosed) {
            this.logger.log('Connection is already closed!');
            return;
        }
        this.aggregatorSocket.write(content + '\n');
    }

    closeConnection() {
        if (connectionError) {
            this.logger.log("Connection already closed due to an error");
            return;
        }
        if (this.isClosed) {
            this.logger.log('Connection is already closed!');
            return;
        }
        this.aggregatorSocket.end();
    }
}

module.exports = TCPSender;