import * as cdk from 'aws-cdk-lib';
import { BinanceClientPipelineStack } from '../lib/binance-client-pipeline-stack';
import { FTXClientPipelineStack } from '../lib/ftx-client-pipeline-stack';
import { ETHSocketClientPipelineStack } from '../lib/eth-socket-collector-pipeline-stack';

const app = new cdk.App();

const branch = process.env.CDK_DEFAULT_ACCOUNT == '356783682912' ? 'development' : 'main'

new BinanceClientPipelineStack(app, 'binance-service-client-pipeline', {
  branchName: branch,
  description: 'Websocket Client for the Binance Exchange',
  tags: {exchange: 'binance', usage: 'websocket-client'},
  env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
});

new FTXClientPipelineStack(app, 'ftx-service-client-pipeline', {
  branchName: branch,
  description: 'Websocket Client for the FTX Exchange',
  tags: {exchange: 'ftx', usage: 'websocket-client'},
  env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
});

new ETHSocketClientPipelineStack(app, 'evm-service-client-pipeline', {
  branchName: branch,
  description: 'Websocket Client for the EVM Networks',
  tags: {blockchain: 'eth', usage: 'service-clients'},
  env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
});
