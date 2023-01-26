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
  /**
   * @internal
   */
  public readyState: StompSocketState;

  /**
   * @internal
   */
  public readonly url: string;

  /**
   * @internal
   */
  public onclose: (ev?: any) => any;

  /**
   * @internal
   */
  public onerror: (ev: any) => any;

  /**
   * @internal
   */
  public onmessage: (ev: IStompSocketMessageEvent) => any;

  /**
   * @internal
   */
  public onopen: (ev?: any) => any;

  private socket: Socket;
  private _closeEvtOnTermination: object | undefined;

  /**
   * Create a new instance
   *
   * @param host
   * @param port
   */
  constructor(host: string, port: number) {
    const noOp = () => {};

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
      } else {
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
  protected getSocket(port: number, host: string) {
    return createConnection(port, host);
  }

  /**
   * @internal
   * @param data
   */
  public send(data: string | ArrayBuffer) {
    if (typeof data === 'string') {
      this.socket.write(data);
    } else {
      this.socket.write(new Uint8Array(data));
    }
  }

  /**
   * @internal
   * @param code
   * @param reason
   */
  public close(code?: number, reason?: string) {
    this.readyState = StompSocketState.CLOSING;
    this.socket.end();
  }

  /**
   * @internal
   */
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
