import {App, Duration, Fn, RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import { GithubEcrPipeline } from './constructs/github-ecr-pipeline/github-ecr-construct';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from "aws-cdk-lib/aws-ssm";

export interface PipelineStackProps extends StackProps {
  branchName: string;
}
export class FTXClientPipelineStack extends Stack {
  constructor(scope: App, id: string, props?: PipelineStackProps) {
    super(scope, id, props);

    const { branchName } = props!;

    const repository = new ecr.Repository(this, 'Repository', {
      removalPolicy: RemovalPolicy.DESTROY
    });
    repository.addLifecycleRule({ tagPrefixList: ['prod'], maxImageCount: 60 });
    repository.addLifecycleRule({ maxImageAge: Duration.days(30) });

    const bucketName = Fn.importValue('artifact-bucket');

    const bucket = s3.Bucket.fromBucketName(this, 's3-bucket', bucketName);

    const pipeline = new GithubEcrPipeline(this, 'BinanceClientCodePipeline', {
      ecrRepository: repository,
      githubRepo: 'websocket-clients',
      branchName: branchName,
      directoryName: 'services/binance-client',
      artifactBucket: bucket
    });

    new ssm.StringParameter(this, 'StreamParameter', {
      description: 'New UNIv2/v3 pairs Kinesis Stream ARN',
      parameterName: `/repositories/websockets/ftx-client`,
      stringValue: repository.repositoryName,
    });
  }
}
