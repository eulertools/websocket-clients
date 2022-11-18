import * as ecr from "aws-cdk-lib/aws-ecr";
import {
  App,
  CfnOutput,
  Duration,
  Fn,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { GithubEcrPipeline } from "./constructs/github-ecr-pipeline/github-ecr-construct";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ssm from "aws-cdk-lib/aws-ssm";

export interface PipelineStackProps extends StackProps {
  branchName: string;
}
export class ETHSocketClientPipelineStack extends Stack {
  constructor(scope: App, id: string, props?: PipelineStackProps) {
    super(scope, id, props);

    const { branchName } = props!;

    const repository = new ecr.Repository(this, "eth-socket-collector", {
      repositoryName: "eth-socket-collector",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // const bucketName = Fn.importValue("artifact-bucket");

    const bucket = new s3.Bucket(this, "s3-bucket", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    repository.addLifecycleRule({ tagPrefixList: ["prod"], maxImageCount: 60 });
    repository.addLifecycleRule({ maxImageAge: Duration.days(30) });

    const pipeline = new GithubEcrPipeline(this, "eth-wss-client-pipeline", {
      ecrRepository: repository,
      githubRepo: "websocket-clients",
      branchName: branchName,
      directoryName: "services/eth-socket-client",
      artifactBucket: bucket,
    });

    new ssm.StringParameter(this, "ECRRepoParameter", {
      parameterName: `/websocket-clients/evm-socket-collector`,
      stringValue: repository.repositoryName,
    });

    new ssm.StringParameter(this, "ArtifactBucket", {
      parameterName: `/websocket-clients/artifact-bucket`,
      stringValue: bucket.bucketName,
    });
  }
}
