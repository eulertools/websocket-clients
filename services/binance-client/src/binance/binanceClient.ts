import { KinesisClient, PutRecordsCommand } from '@aws-sdk/client-kinesis';
import Binance from 'node-binance-api';
import { appConfig } from '../config/default';
import { validateObject } from '../util/validator';
import logW from '../log';

const Sentry = require('../config/sentry');

const {API_KEY, API_SECRET} = process.env;

const {aws_config} = appConfig();

const kinesisClient = new KinesisClient({region: aws_config.region});

export const BinanceClient = () => {
  const client = new Binance({reconnect: true}, console.log);

  client.options({API_KEY, API_SECRET});

  let pairs: Map<string, any> = new Map();
  const getPairs = async (): Promise<Map<string, any>> => {
    if (pairs.size <= 0) await loadPairs();
    return pairs;
  };

  const loadPairs = async () => {
    const promise = client.exchangeInfo().catch((e: any) => {
      logW.error(e);
      setTimeout(() => {
        loadPairs();
      }, 1000);
    });

    return promise.then((info: any) => {
      for (const symbol of info.symbols) {
        pairs.set(symbol.symbol, {
          identifier: symbol.symbol,
          ticker: symbol.baseAsset,
          magnitude: symbol.quoteAsset,
        });
      }
    });
  };

  const listenWebsocket = async () => {
    let pairs: any;
    try {
      pairs = await getPairs();
    } catch (error) {
      Sentry.captureException(`Failed to get pairs, error occured ${JSON.stringify(error)}`);
      throw error;
    }

    client.websockets.prevDay(false, async (err: any, event: any) => {
      if (err) {
        logW.error(`API error: ${err}`);
        throw err;
      }

      const pairRecords: any[] = [];

      try {
        const pair = pairs.get(event.symbol);
        if (validateObject(pair)) {
          const pairData = {
            ticker: pair.ticker.toUpperCase(),
            identifier: pair.identifier,
            category: 'crypto',
            magnitude: pair.magnitude.toUpperCase(),
            source: 'binance.com',
            location: 'spot',
            value: event.bestAsk,
            time: new Date(Math.floor(event.eventTime)),
          };

          pairRecords.push({
            Data: Buffer.from(JSON.stringify({...pairData})),
            PartitionKey: `${pairData.magnitude}-${new Date().getTime()}`,
          });
        }
      } catch (error) {
        Sentry.captureException(
          `Failed to parse the pairs data, error occured ${JSON.stringify(error)}`
        );
        throw error;
      }

      try {
        kinesisClient.send(
          new PutRecordsCommand({
            Records: pairRecords,
            StreamName: 'price-updates',
          })
        );
      } catch (error) {
        Sentry.captureException(
          `Failed to stream records in kinesis, error occured ${JSON.stringify(error)}`
        );
        throw error;
      }
    });

    function check_sockets() {
      let endpoints = client.websockets.subscriptions();
      // @ts-ignore
      const websocket = endpoints['!ticker@arr'];
      if (websocket) {
        if (websocket.isAlive) {
          console.log({status: 'connected', client: 'binance'});
        } else {
          console.log({status: 'disconnected', client: 'binance'});
        }
      } else {
        console.log({status: 'connecting', client: 'binance'});
      }
    }

    setInterval(check_sockets, 999);
  };

  const init = async () => {
    await listenWebsocket();
  };

  init().then((r) => console.log('Binance Client Started'));
};
