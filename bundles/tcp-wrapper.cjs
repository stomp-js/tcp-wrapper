'use strict';

var net = require('net');

/**
 * Possible states for the IStompSocket
 */
var StompSocketState;
(function (StompSocketState) {
    StompSocketState[StompSocketState["CONNECTING"] = 0] = "CONNECTING";
    StompSocketState[StompSocketState["OPEN"] = 1] = "OPEN";
    StompSocketState[StompSocketState["CLOSING"] = 2] = "CLOSING";
    StompSocketState[StompSocketState["CLOSED"] = 3] = "CLOSED";
})(StompSocketState = StompSocketState || (StompSocketState = {}));
/**
 * Possible activation state
 */
var ActivationState;
(function (ActivationState) {
    ActivationState[ActivationState["ACTIVE"] = 0] = "ACTIVE";
    ActivationState[ActivationState["DEACTIVATING"] = 1] = "DEACTIVATING";
    ActivationState[ActivationState["INACTIVE"] = 2] = "INACTIVE";
})(ActivationState = ActivationState || (ActivationState = {}));

/**
 * Wrapper for a TCP socket to make it behave similar to the WebSocket interface
 */
class TCPWrapper {
    /**
     * Create a new instance
     *
     * @param host
     * @param port
     */
    constructor(host, port) {
        const noOp = () => { };
        // NoOp callbacks to simplify logic
        this.onclose = noOp;
        this.onerror = noOp;
        this.onmessage = noOp;
        this.onopen = noOp;
        this.url = `tcp://${host}/${port}/`;
        this.readyState = StompSocketState.CONNECTING;
        this.socket = this.getSocket(port, host);
        this.socket.on('connect', () => {
            this.readyState = StompSocketState.OPEN;
            this.onopen();
        });
        this.socket.on('data', ev => {
            this.onmessage({ data: ev });
        });
        this.socket.on('close', hadError => {
            this.readyState = StompSocketState.CLOSED;
            if (this._closeEvtOnTermination) {
                this.onclose(this._closeEvtOnTermination);
            }
            else {
                this.onclose({ wasClean: !hadError, type: 'CloseEvent', code: 1000 });
            }
        });
        this.socket.on('error', ev => {
            this.onerror({ type: 'Error', error: 100, message: ev });
        });
    }
    /**
     * In case you need to set custom options in the underlying TCP Socket,
     * override this method.
     *
     * @param port
     * @param host
     * @protected
     */
    getSocket(port, host) {
        return net.createConnection(port, host);
    }
    /**
     * @internal
     * @param data
     */
    send(data) {
        if (typeof data === 'string') {
            this.socket.write(data);
        }
        else {
            this.socket.write(new Uint8Array(data));
        }
    }
    /**
     * @internal
     * @param code
     * @param reason
     */
    close(code, reason) {
        this.readyState = StompSocketState.CLOSING;
        this.socket.end();
    }
    /**
     * @internal
     */
    terminate() {
        this.readyState = StompSocketState.CLOSING;
        this._closeEvtOnTermination = {
            wasClean: false,
            type: 'CloseEvent',
            code: 4001,
        };
        this.socket.destroy();
    }
}

exports.TCPWrapper = TCPWrapper;
//# sourceMappingURL=tcp-wrapper.cjs.map
