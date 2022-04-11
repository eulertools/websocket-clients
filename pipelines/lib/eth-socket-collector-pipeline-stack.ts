import * as ecr from 'aws-cdk-lib/aws-ecr';
import { App, Fn, Stack, StackProps } from 'aws-cdk-lib';
import { GithubEcrPipeline } from './constructs/github-ecr-pipeline/github-ecr-construct';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface PipelineStackProps extends StackProps {
  branchName: string;
}
export class ETHSocketClientPipelineStack extends Stack {
  constructor(scope: App, id: string, props?: PipelineStackProps) {
    super(scope, id, props);

    const { branchName } = props!;

    const repositoryName = Fn.importValue('eth-socket-collector-repo');

    const repository = ecr.Repository.fromRepositoryName(this, 'eth-socket-collector', repositoryName);

    const bucketName = Fn.importValue('artifact-bucket');

    const bucket = s3.Bucket.fromBucketName(this, 's3-bucket', bucketName);

    const pipeline = new GithubEcrPipeline(this, 'eth-wss-client-pipeline', {
      ecrRepository: repository,
      githubRepo: 'service-clients',
      branchName: branchName,
      directoryName: 'services/eth-socket-client',
      artifactBucket: bucket
    });
  }
}
