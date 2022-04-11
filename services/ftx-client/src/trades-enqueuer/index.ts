import { KinesisClient, PutRecordsCommand } from '@aws-sdk/client-kinesis';
import { web3Client } from "../web3Clients";
import snakecaseKeys from "snakecase-keys";

import { appConfig } from '../config/default'

const { stream_config, aws_config } = appConfig();

const sendKinesis = async (kinesisClient: any, mappedLogs: any) => {

  let i, j, logBatch;

  for (i = 0, j = mappedLogs.length; i < j; i += 25) {

    logBatch = mappedLogs.slice(i, i + 25);

    await kinesisClient.send(
      new PutRecordsCommand({
        Records: logBatch,
        StreamName: stream_config.logs_stream_name,
      })
    ).then((response: any) => console.log(response)).catch((e: any) => {
      console.log("Error streaming to kinesis", JSON.stringify(e))
      throw e
    })
  }
}

export const backfillTopic = async () => {

  const kinesisClient = new KinesisClient({ region: aws_config.region });

  const startBlock: any = process.env.START_BLOCK;
  const lastBlock: any = process.env.END_BLOCK;

  if (startBlock && lastBlock) {
    for (let i = lastBlock; i >= startBlock; i--) {
      const block: any = await web3Client.eth.getBlock(i);

      const logs: any[] = await web3Client.eth.getPastLogs({
        fromBlock: i, toBlock: i,
        topics: [process.env.TOPIC]
      });

      if (logs.length > 0) {
        const mappedLogs = logs.map((log: any) => (
          {
            Data: Buffer.from(
              JSON.stringify(snakecaseKeys({
                ...log,
                address: log.address.toLowerCase(),
                topic0: log.topics[0],
                topic1: log.topics[1],
                topic2: log.topics[2],
                topic3: log.topics[3],
                block_timestamp: new Date(block.timestamp * 1000).toISOString(),
              }))),
            PartitionKey: `LOGS-${new Date().getTime()}`,
          }
        ))

        await sendKinesis(kinesisClient, mappedLogs);
      }
    }
  }
}
