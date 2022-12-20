export const BuildSpecContent = {
  version: '0.2',
  phases: {
    install: {
      'runtime-versions': {
        nodejs: '14',
      },
      commands: ['npm install'],
    },
    pre_build: {
      commands: [
        'echo Entering into pre build stage',
        'echo Logging in to Amazon ECR...',
        'aws --version',
        'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com',
        'REPOSITORY_URI=$IMAGE_URI',
        'COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)',
        'echo Pre Build Stage Completed',
      ],
    },
    build: {
      commands: [
        'echo Entering into Build Stage',
        'echo Build Started',
        'echo Building the Docker image...',
        'cd $DIR_NAME',
        'docker build -t $REPOSITORY_URI:latest .',
        'echo Image Build Successfully...',
        'docker images',
        'docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$TAG',
        'echo Image tagges Successfully...',
        'cd ../../',
      ],
    },
    post_build: {
      commands: [
        'echo Entering into Post Build Stage',
        'echo Post Build Started',
        'echo Pushing Image to ECR Repository',
        'docker push $REPOSITORY_URI:latest',
        'echo Image Pushed into ECR Successfully..',
        'printf \'[{"name":"%s","imageUri":"%s"}]\' "$REPO_NAME" "$REPOSITORY_URI:$TAG" > imageDetail.json',
      ],
    },
  },
  artifacts: {
    files: ['imageDetail.json', 'imagedefinitions.json', 'appspec.yaml', 'taskdef.json'],
  },
};
