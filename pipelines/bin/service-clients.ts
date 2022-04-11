import * as cdk from 'aws-cdk-lib';
import { BinanceClientPipelineStack } from '../lib/binance-client-pipeline-stack';
import { FTXClientPipelineStack } from '../lib/ftx-client-pipeline-stack';
import { ETHSocketClientPipelineStack } from '../lib/eth-socket-collector-pipeline-stack';

const app = new cdk.App();

const branch = process.env.CDK_DEFAULT_ACCOUNT == '356783682912' ? 'development' : 'main'

new BinanceClientPipelineStack(app, 'BinanceClientPipelineStack', {
  branchName: branch,
  description: 'Data Collectors pipeline for the Binance Exchange',
  tags: {exchange: 'binance', usage: 'service-clients'},
  env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
});

new FTXClientPipelineStack(app, 'FTXClientPipelineStack', {
  branchName: branch,
  description: 'Data Collectors for the Binance Exchange',
  tags: {exchange: 'ftx', usage: 'service-clients'},
  env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
});

new ETHSocketClientPipelineStack(app, 'ETHSocketClientPipelineStack', {
  branchName: branch,
  description: 'Data Collectors for the Binance Exchange',
  tags: {exchange: 'eth', usage: 'service-clients'},
  env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
});
