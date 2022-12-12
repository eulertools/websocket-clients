import dotenv from 'dotenv';

dotenv.config();

// This function will be responsible to read values from either static file storage or dyanmodb
export const appConfig = () => ({
  aws_config: {
    region: process.env.AWS_REGION || 'us-east-1',
  },
  stream_config: {
    logs_stream_name: `${process.env.CHAIN_ID}-logs`,
    queue_url: `${process.env.CHAIN_ID}-blocks`,
  },
  config: {
    full_wss:
      process.env.NODE_WS || `wss://${process.env.CHAIN_ID}.nodes.prod.euler.tools/ws` || '',
    env: process.env.NODE_ENV || 'development',
    mode: process.env.MODE || '',
    new_block_topic: process.env.NEW_BLOCK_TOPIC || '',
    chain_id: process.env.CHAIN_ID || '',
    dsn_url: process.env.DSN_URL || '',
  },
});

export const providerOptions = {
  timeout: 30000, // ms

  clientConfig: {
    // Useful if requests are large
    maxReceivedFrameSize: 100000000, // bytes - default: 1MiB
    maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

    // Useful to keep a connection alive
    keepalive: true,
    keepaliveInterval: -1, // ms
  },

  // Enable auto reconnection
  reconnect: {
    auto: true,
    delay: 1000, // ms
    maxAttempts: 10000,
    onTimeout: false,
  },
};
