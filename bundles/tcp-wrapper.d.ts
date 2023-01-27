/// <reference types="node" resolution-mode="require"/>
import { Socket } from 'net';
import { IStompSocket, IStompSocketMessageEvent, StompSocketState } from '@stomp/stompjs';
/**
 * Wrapper for a TCP socket to make it behave similar to the WebSocket interface
 */
export declare class TCPWrapper implements IStompSocket {
    /**
     * @internal
     */
    readyState: StompSocketState;
    /**
     * @internal
     */
    readonly url: string;
    /**
     * @internal
     */
    onclose: (ev?: any) => any;
    /**
     * @internal
     */
    onerror: (ev: any) => any;
    /**
     * @internal
     */
    onmessage: (ev: IStompSocketMessageEvent) => any;
    /**
     * @internal
     */
    onopen: (ev?: any) => any;
    private socket;
    private _closeEvtOnTermination;
    /**
     * Create a new instance
     *
     * @param host
     * @param port
     */
    constructor(host: string, port: number);
    /**
     * In case you need to set custom options in the underlying TCP Socket,
     * override this method.
     *
     * @param port
     * @param host
     * @protected
     */
    protected getSocket(port: number, host: string): Socket;
    /**
     * @internal
     * @param data
     */
    send(data: string | ArrayBuffer): void;
    /**
     * @internal
     * @param code
     * @param reason
     */
    close(code?: number, reason?: string): void;
    /**
     * @internal
     */
    terminate(): void;
}
