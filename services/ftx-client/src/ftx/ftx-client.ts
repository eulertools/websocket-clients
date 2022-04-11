import { appConfig } from "../config/default";
import { RestClient, WebsocketClient } from "ftx-api";
import { KinesisClient, PutRecordsCommand } from "@aws-sdk/client-kinesis";
import { validateObject } from "../util/validator";

const Sentry = require("../config/sentry");

const {API_KEY, API_SECRET} = process.env;

const {aws_config} = appConfig();

const kinesisClient = new KinesisClient({region: aws_config.region});

const wsConfig = {
  key: API_KEY,
  secret: API_SECRET,
};

export const FTXClient = () => {
  const ws = new WebsocketClient(wsConfig);

  const client = new RestClient(API_KEY, API_SECRET);

  try {
    client.getMarkets().then((result) => {
      let markets = result.result
        .filter((record: any) => record.type === "spot")
        .map((data: any) => {
          return {channel: "ticker", market: data.name};
        });
      ws.subscribe(markets);
    });
  } catch (error) {
    Sentry.captureException(`getMarkets error ${JSON.stringify(error)}`);
    throw error;
  }

  ws.on("update", (records: any) => {
    const ftxRecordsData: any[] = [];
    if (records.data) {
      const {market, data} = records;
      if (validateObject(records.data)) {
        const fields = market.split("/");
        const ftxData = {
          ticker: fields[0],
          identifier: market,
          category: "crypto",
          magnitude: fields[1],
          source: "ftx.com",
          location: "spot",
          value: data.last,
          time: new Date(data.time * 1000),
        };

        ftxRecordsData.push({
          Data: Buffer.from(JSON.stringify({...ftxData})),
          PartitionKey: `${ftxData.magnitude}-${new Date().getTime()}`,
        });
      }

      if (records.length > 1) {
        try {
          kinesisClient.send(
            new PutRecordsCommand({
              Records: ftxRecordsData,
              StreamName: "price-updates",
            })
          );
        } catch (error) {
          Sentry.captureException(`getMarkets error ${JSON.stringify(error)}`);
        }
      }
    }
  });

  ws.on("open", () => {
    console.log("FTX Websocket connection open");
  });

  ws.on("close", () => {
    console.log("FTX Websocket connection closed");
  });

  ws.on("error", (err: any) => {
    console.error("FTX Websocket connection error", JSON.stringify(err));
  });
};
