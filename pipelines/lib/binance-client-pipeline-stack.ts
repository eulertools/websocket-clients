import { App, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { GithubEcrPipeline } from './constructs/github-ecr-pipeline/github-ecr-construct';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export interface PipelineStackProps extends StackProps {
  branchName: string;
}

export class BinanceClientPipelineStack extends Stack {
  constructor(scope: App, id: string, props?: PipelineStackProps) {
    super(scope, id, props);

    const {branchName} = props!;

    const repository = new ecr.Repository(this, 'Repository', {
      removalPolicy: RemovalPolicy.DESTROY
    });
    repository.addLifecycleRule({tagPrefixList: ['prod'], maxImageCount: 60});
    repository.addLifecycleRule({maxImageAge: Duration.days(30)});

    const pipeline = new GithubEcrPipeline(this, 'BinanceClientCodePipeline', {
      ecrRepository: repository,
      githubRepo: 'websocket-clients',
      branchName: branchName,
      directoryName: 'services/binance-client',
    });

    new ssm.StringParameter(this, 'StreamParameter', {
      description: 'Repository for the Binance Socket Client',
      parameterName: `/repositories/websockets/binance-client`,
      stringValue: repository.repositoryName,
    });
  }
}
