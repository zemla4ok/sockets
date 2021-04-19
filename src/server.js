const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({port: 8080});
const CoinbasePro = require('coinbase-pro');

const DEFAULT_INTERVAL = 250;
const TYPE_RECEIVED = 'received';
const VIEWS = {
  MATCHES: 'matches',
  PRICE: 'price'
};
const SUBMERHODS = {
  SYMBOL: {
    MATCHES: 'm',
    UNSUBSCRIBE: 'u'
  }
};
const SUBMETHOD_POSITION = 1;

wss.on('connection', function(ws) {
  let data;
  let timer;
  let handler;

  let interval = DEFAULT_INTERVAL;
  let prevSymbol;
  let view;

  const cbSocket = new CoinbasePro.WebsocketClient();
  cbSocket.on('message', cbData => {
    if(cbData.type === TYPE_RECEIVED) {
      data = cbData;
    }
  });

  ws.on('message', (message) => {
    switch (true) {
      case /(BTC-USD|ETH-USD|XRP-USD|LTC-USD)/.test(message):
        const priceHandler = () => {
          ws.send(`${prevSymbol}: ${data.price}`);
        };

        const matchesHandler = () => {
          ws.send(`${prevSymbol}: ${data.price} with trade ${data.size} [${data.time}]`);
        };

        clearInterval(timer);
        if(prevSymbol) {
          cbSocket.unsubscribe({channels: [{name: 'level2', product_ids: [prevSymbol]}]});
        }

        const [newSymbol, subMethod] = message.split(' ');
        prevSymbol = newSymbol;

        if(subMethod === SUBMERHODS.SYMBOL.UNSUBSCRIBE) {
          prevSymbol = null;
          ws.send('You are unsubscribed');
          break;
        }
        handler = subMethod === SUBMERHODS.SYMBOL.MATCHES ? matchesHandler : priceHandler;
        view = subMethod === SUBMERHODS.SYMBOL.MATCHES ? VIEWS.MATCHES : VIEWS.PRICE;

        cbSocket.subscribe({ product_ids: [newSymbol], channels: ['level2'] });
        timer = setInterval(handler, interval);
        break;
      case /system/.test(message):
        const newInterval = message.split(' ')[SUBMETHOD_POSITION];

        if(newInterval) {
          interval = newInterval;
          if(timer) {
            clearInterval(timer);
            timer = setInterval(handler, newInterval);
          }
          interval = newInterval;
          ws.send(`Your update interval changed to ${newInterval}ms`)
        } else {
          const status = prevSymbol ? `You are subscribed on ${prevSymbol} with ${interval} in ${view} view.` : `Your subscription is stopped.`;
          ws.send(status)
        }
        break;
      case /quit/.test(message):
        cbSocket.unsubscribe({ channels: ['full'] });
        ws.send('See you again :)');
        ws.terminate();
        break;
      default:
        clearInterval(timer);
        interval = null;
        ws.send("Incorrect message.");
        break;
    }
  });

  ws.send("You joined to coinbase subscription.");
});
