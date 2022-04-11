import { blockClient } from './eth';
import * as Sentry from '@sentry/node';
import { web3 } from './eth/websocket';

// Importing @sentry/tracing patches the global hub for tracing to work.

Sentry.init({
  dsn: process.env.DSN_URL,
  tracesSampleRate: 1.0,
});

const service = async () => {
  console.log("Started service")
  console.log(web3.currentProvider)
  blockClient(web3);
};

setTimeout(() => {
  try {
    service();
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
  }
}, 99);
