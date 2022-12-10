import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { IRepository } from 'aws-cdk-lib/aws-ecr';
import {
  BuildEnvironmentVariableType,
  BuildSpec,
  Cache,
  LinuxBuildImage,
  LocalCacheMode,
  PipelineProject,
} from 'aws-cdk-lib/aws-codebuild';
import { BuildSpecContent } from './buildspec-content';
import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface PipelineProps extends StackProps {
  ecrRepository: IRepository;
  githubRepo: string;
  branchName: string;
  directoryName: string;
}

export class GithubEcrPipeline extends Construct {
  constructor(stack: Stack, id: string, props?: PipelineProps) {
    super(stack, id);

    const { ecrRepository, githubRepo, branchName, directoryName } = props!;

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    const githubSourceAction = new GitHubSourceAction({
      actionName: 'Github-Commit-Source-Action',
      output: sourceOutput,
      owner: 'eulertools',
      repo: githubRepo,
      branch: branchName,
      oauthToken: SecretValue.secretsManager('githubToken'),
    });

    const codeBuildProject = new PipelineProject(stack, `CodeBuildProject`, {
      projectName: `${stack.stackName}-build-project`,
      environment: {
        buildImage: LinuxBuildImage.STANDARD_5_0,
        privileged: true,
      },
      environmentVariables: {
        ACCOUNT_ID: {
          value: process.env.CDK_DEFAULT_ACCOUNT,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
        ACCOUNT_REGION: {
          value: process.env.CDK_DEFAULT_REGION,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
        IMAGE_URI: {
          value: ecrRepository.repositoryUri,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
        REPO_NAME: {
          value: ecrRepository.repositoryName,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
        TAG: {
          value: 'latest',
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
        DIR_NAME: {
          value: directoryName,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
      },
      buildSpec: BuildSpec.fromObject(BuildSpecContent),
      cache: Cache.local(LocalCacheMode.DOCKER_LAYER, LocalCacheMode.CUSTOM),
    });

    ecrRepository.grantPullPush(codeBuildProject);

    const buildAction = new CodeBuildAction({
      actionName: 'Code-Build-Action',
      input: sourceOutput,
      project: codeBuildProject,
      outputs: [buildOutput],
    });

    const bucketName = ssm.StringParameter.fromStringParameterName(this, 'BucketName', `SharedArtifactsBucket`).stringValue
    const artifactBucket = s3.Bucket.fromBucketName(this, 'ArtifactsBucket', bucketName)

    const pipeline = new codepipeline.Pipeline(this, `${stack.stackName}-CodePipeline`, {
      pipelineName: `${stack.stackName}`,
      stages: [
        {
          stageName: 'Source',
          actions: [githubSourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        },
      ],
      artifactBucket: artifactBucket,
    });
  }
}
