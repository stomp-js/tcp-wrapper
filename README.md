# STOMP over TCP for Node.js with @stomp/rx-stomp or @stomp/stompjs

This repository contains a wrapper that allows using Node.js TCP sockets to be used with the [@stomp/rx-stomp] and [@stomp/stompjs] libraries for STOMP over TCP communication.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/)
- [@stomp/rx-stomp] or [@stomp/stompjs]

### Installing

```bash
$ npm i @stomp/tcp-wrapper
```

In addition, you must install one of [@stomp/rx-stomp] or [@stomp/stompjs].

### Usage

#### With [@stomp/rx-stomp]

```javascript
import { TCPWrapper } from '@stomp/tcp-wrapper';
import { RxStomp } from '@stomp/rx-stomp';

const rxStomp = new RxStomp();
rxStomp.configure({
  // hostname (or ip addess) and port number of the STOMP broker
  webSocketFactory: () => new TCPWrapper('127.0.0.1', 61613),
  heartbeatOutgoing: 20000,
  heartbeatIncoming: 20000,
  debug: console.log,
});

const subscription = rxStomp
  .watch({ destination: '/topic/test-rx' })
  .subscribe(message => console.log(message.body));

rxStomp.activate();

rxStomp.publish({
  destination: '/topic/test-rx',
  body: 'First message to RxStomp',
});

setTimeout(async () => {
  subscription.unsubscribe();
  await rxStomp.deactivate();
}, 3000);
```

#### With [@stomp/stompjs]

```javascript
import { Client } from '@stomp/stompjs';
import { TCPWrapper } from '@stomp/tcp-wrapper';

const client = new Client({
  // hostname (or ip addess) and port number of the STOMP broker
  webSocketFactory: () => new TCPWrapper('127.0.0.1', 61613),
  heartbeatOutgoing: 20000,
  heartbeatIncoming: 20000,
  debug: console.log,
  onConnect: () => {
    client.subscribe('/topic/test01', message =>
      console.log(`Received: ${message.binaryBody}`)
    );
    client.publish({ destination: '/topic/test01', body: 'First Message' });
  },
});

client.activate();

setTimeout(() => client.deactivate(), 3000);
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/stomp-js/tcp-wrapper/tags).

## Authors

- [Deepak Kumar](https://github.com/kum-deepak)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

[@stomp/stompjs]: https://github.com/stomp-js/stompjs
[@stomp/rx-stomp]: https://github.com/stomp-js/rx-stomp
