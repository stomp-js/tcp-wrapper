import { createConnection, Socket } from 'net';
import {
  IStompSocket,
  IStompSocketMessageEvent,
  StompSocketState,
} from '@stomp/stompjs';

/**
 * Wrapper for a TCP socket to make it behave similar to the WebSocket interface
 */
export class TCPWrapper implements IStompSocket {
  public readyState: StompSocketState;
  public readonly url: string;
  public binaryType: string = '';

  public onclose: ((ev?: any) => any) | null = null;
  public onerror: ((ev: any) => any) | null = null;
  public onmessage: ((ev: IStompSocketMessageEvent) => any) | null = null;
  public onopen: ((ev?: any) => any) | null = null;
  private socket: Socket;
  private _closeEvtOnTermination: object | undefined;

  constructor(host: string, port: number) {
    const noOp = () => {};

    this.url = `tcp://${host}/${port}/`;
    this.readyState = StompSocketState.CONNECTING;

    this.socket = createConnection(port, host, () => {
      if (typeof this.onopen === 'function') {
        this.readyState = StompSocketState.OPEN;
        this.onopen();
      }
    });

    this.socket.on('data', ev => {
      if (typeof this.onmessage === 'function') {
        this.onmessage({ data: ev });
      }
    });

    this.socket.on('close', hadError => {
      this.readyState = StompSocketState.CLOSED;
      if (typeof this.onclose === 'function') {
        if (this._closeEvtOnTermination) {
          this.onclose(this._closeEvtOnTermination);
        } else {
          this.onclose({ wasClean: !hadError, type: 'CloseEvent', code: 1000 });
        }
      }
    });

    this.socket.on('error', ev => {
      if (typeof this.onerror === 'function') {
        this.onerror({ type: 'Error', error: 100, message: ev });
      }
    });
  }

  public send(data: string | ArrayBuffer) {
    if (typeof data === 'string') {
      this.socket.write(data);
    } else {
      this.socket.write(new Uint8Array(data));
    }
  }

  public close(code?: number, reason?: string) {
    this.readyState = StompSocketState.CLOSING;
    this.socket.end();
  }

  public terminate() {
    this.readyState = StompSocketState.CLOSING;
    this._closeEvtOnTermination = {
      wasClean: false,
      type: 'CloseEvent',
      code: 4001,
    };
    this.socket.destroy();
  }
}
