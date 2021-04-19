const WebSocket = require('ws');

describe('Websocket server tests', function() {
  it('Connection Test', function(done) {
    const client = new WebSocket('ws://localhost:8080');
    client.on('open', () => {
      done();
    });
  });

  it('Incorrect message', function(done) {
    const client = new WebSocket('ws://localhost:8080');
    client.on('open', () => {
      client.on('message', (message) => {
        if(message === 'Incorrect message.') {
          done();
        }
      })
      client.send('BTC_USD');
    });
  });

  it('Quit test', function(done) {
    const client = new WebSocket('ws://localhost:8080');
    client.on('open', () => {
      client.on('message', (message) => {
        if(message === 'See you again :)') {
          done();
        }
      })
      client.send('quit');
    });
  });

  it('System status', function(done) {
    const client = new WebSocket('ws://localhost:8080');
    client.on('open', () => {
      client.on('message', (message) => {
        if(message === 'Your subscription is stopped.') {
          done();
        }
      })
      client.send('system');
    });
  });

  it('Change time', function(done) {
    const newInterval = 500;
    const client = new WebSocket('ws://localhost:8080');
    client.on('open', () => {
      client.on('message', (message) => {
        if(message === `Your update interval changed to ${newInterval}ms`) {
          done();
        }
      })
      client.send(`system ${newInterval}`);
    });
  });

  it('Unsubscribe', function(done) {
    const symbol = 'BTC-USD';
    const client = new WebSocket('ws://localhost:8080');
    client.on('open', () => {
      client.on('message', (message) => {
        if(message === 'You are unsubscribed') {
          done();
        }
      })
      client.send(`${symbol} u`);
    });
  });
})
