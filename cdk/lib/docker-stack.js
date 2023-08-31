const cdk = require('aws-cdk-lib');
const ecr = require('aws-cdk-lib/aws-ecr');
const ecrAssets = require('aws-cdk-lib/aws-ecr-assets');

class EcrDockerStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create ECR repositories for storing Docker images
    const uiEcrRepo = new ecr.Repository(this, 'UiEcrRepo', {
      repositoryName: 'ui-repo',
    });

    const websiteEcrRepo = new ecr.Repository(this, 'WebsiteEcrRepo', {
      repositoryName: 'website-repo',
    });

    // Create Docker image assets and upload them to the ECR repositories
    new ecrAssets.DockerImageAsset(this, 'UiDockerImage', {
      directory: '../packages/ui', // Location of the Dockerfile for the UI image
      repository: uiEcrRepo,
    });

    new ecrAssets.DockerImageAsset(this, 'WebsiteDockerImage', {
      directory: '../packages/website', // Location of the Dockerfile for the Website image
      repository: websiteEcrRepo,
    });

    new cdk.CfnOutput(this, 'UiRepoUri', {
      value: uiEcrRepo.repositoryUri,
    });

    new cdk.CfnOutput(this, 'WebsiteRepoUri', {
      value: websiteEcrRepo.repositoryUri,
    });
  }
}

module.exports = { EcrDockerStack };
