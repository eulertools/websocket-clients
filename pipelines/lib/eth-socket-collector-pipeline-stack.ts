import * as ecr from 'aws-cdk-lib/aws-ecr';
import {App, CfnOutput, Duration, Fn, RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import { GithubEcrPipeline } from './constructs/github-ecr-pipeline/github-ecr-construct';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from "aws-cdk-lib/aws-ssm";

export interface PipelineStackProps extends StackProps {
  branchName: string;
}
export class ETHSocketClientPipelineStack extends Stack {
  constructor(scope: App, id: string, props?: PipelineStackProps) {
    super(scope, id, props);

    const { branchName } = props!;

    const repository = new ecr.Repository(this, 'Repository', {
      removalPolicy: RemovalPolicy.DESTROY
    });
    repository.addLifecycleRule({ tagPrefixList: ['prod'], maxImageCount: 60 });
    repository.addLifecycleRule({ maxImageAge: Duration.days(30) });

    // const bucketName = Fn.importValue("artifact-bucket");

    const bucket = new s3.Bucket(this, "Bucket", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const pipeline = new GithubEcrPipeline(this, 'BinanceClientCodePipeline', {
      ecrRepository: repository,
      githubRepo: "websocket-clients",
      branchName: branchName,
      directoryName: 'services/binance-client',
    });

    new ssm.StringParameter(this, 'RepositorySSM', {
      description: 'Repository for the Web3 Socket Client',
      parameterName: `/repositories/websockets/evm-client`,
      stringValue: repository.repositoryName,
    });
  }
}
