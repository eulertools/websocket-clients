import * as ecr from 'aws-cdk-lib/aws-ecr';
import {App, CfnOutput, Duration, Fn, RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import { GithubEcrPipeline } from './constructs/github-ecr-pipeline/github-ecr-construct';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface PipelineStackProps extends StackProps {
  branchName: string;
}
export class ETHSocketClientPipelineStack extends Stack {
  constructor(scope: App, id: string, props?: PipelineStackProps) {
    super(scope, id, props);

    const { branchName } = props!;

    const repository = new ecr.Repository(this, 'eth-socket-collector', {
      repositoryName: 'eth-socket-collector',
      removalPolicy: RemovalPolicy.DESTROY
    });

    const bucketName = Fn.importValue('artifact-bucket');

    const bucket = s3.Bucket.fromBucketName(this, 's3-bucket', bucketName);

    repository.addLifecycleRule({ tagPrefixList: ['prod'], maxImageCount: 60 });
    repository.addLifecycleRule({ maxImageAge: Duration.days(30) });

    const pipeline = new GithubEcrPipeline(this, 'eth-wss-client-pipeline', {
      ecrRepository: repository,
      githubRepo: 'service-clients',
      branchName: branchName,
      directoryName: 'services/eth-socket-client',
      artifactBucket: bucket
    });

    new CfnOutput(this, 'eth-socket-collector-repo', {
      value: repository.repositoryName,
      exportName: 'eth-socket-collector-repo',
    });
  }
}
