import {BinanceClient} from './binance';
import {appConfig} from './config/default';
import * as Sentry from '@sentry/node';

// Importing @sentry/tracing patches the global hub for tracing to work.

Sentry.init({
  dsn: "https://ffeb88063a3c4d0dbdbd96ae221adf78@o444369.ingest.sentry.io/6697999",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const service = async () => {
  BinanceClient();
};

setTimeout(() => {
  try {
    service();
  } catch (e) {
    Sentry.captureException(e);
  }
}, 99);
