import { appConfig } from './config/default';
import { FTXClient } from './ftx/ftx-client';
import * as Sentry from '@sentry/node';

// Importing @sentry/tracing patches the global hub for tracing to work.

const {config} = appConfig();

Sentry.init({
  dsn: process.env.DSN_URL,
  tracesSampleRate: 1.0,
});

const service = async () => {
  switch (config.mode) {
    case 'ftxClient': {
      FTXClient();
      break;
    }
  }
};

setTimeout(() => {
  try {
    service();
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
  }
}, 99);
