const cdk = require("aws-cdk-lib");
const ecr = require("aws-cdk-lib/aws-ecr");
const ecrAssets = require("aws-cdk-lib/aws-ecr-assets");
const path = require("path");

class EcrDockerStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const websiteEcrRepo = new ecr.Repository(this, "WebsiteEcrRepo", {
      repositoryName: "website-repo",
    });

    // Create Docker image asset and upload to the ECR repository
    new ecrAssets.DockerImageAsset(this, "WebsiteDockerImage", {
      directory: path.join(__dirname, "../../../lucky-parking"),
      repository: websiteEcrRepo,
    });

    new cdk.CfnOutput(this, "WebsiteRepoUri", {
      value: websiteEcrRepo.repositoryUri,
    });
  }
}

module.exports = { EcrDockerStack };
