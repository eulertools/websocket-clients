import { appConfig } from '../default';

const Sentry = require('@sentry/node');

const {config} = appConfig();

Sentry.init({
  dsn: config.dsn_url,
  tracesSampleRate: 1.0,
});

module.exports = Sentry;
