const cdk = require("aws-cdk-lib");
const ecr = require("aws-cdk-lib/aws-ecr");
const ecrAssets = require("aws-cdk-lib/aws-ecr-assets");
const s3 = require("aws-cdk-lib/aws-s3");
const s3Assets = require("aws-cdk-lib/aws-s3-assets");
const path = require("path");

class EcrDockerStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create Docker image asset and upload to the ECR repository
    this.dockerImageAsset = new ecrAssets.DockerImageAsset(this, "WebsiteDockerImage", {
      directory: path.join(__dirname, "../../../lucky-parking"),
    });

    // Creates an S3 bucket to store Dockerrun file which points to Docker image on ECR
    this.dockerrunBucket = new s3.Bucket(this, "DockerrunBucket");

    // adds the Dockerrun file into the S3 bucket
    this.dockerrunAsset = new s3Assets.Asset(this, "DockerrunAsset", {
      path: path.join(__dirname, "../Dockerrun.aws.json"),
    });

    new cdk.CfnOutput(this, "WebsiteRepoUri", {
      value: this.dockerImageAsset.imageUri,
    });
    new cdk.CfnOutput(this, "DockerrunBucketName", {
      value: this.dockerrunBucket.bucketName,
    });
    new cdk.CfnOutput(this, "DockerrunS3Key", {
      value: this.dockerrunAsset.s3ObjectKey,
    });
    // added something

    console.log("CFN Outputs:", this.dockerrunBucket.bucketName, this.dockerrunAsset.s3ObjectKey);
  }
}

module.exports = { EcrDockerStack };

// Don't think I need this:
// const websiteEcrRepo = new ecr.Repository(this, "WebsiteEcrRepo", {
//   repositoryName: "website-repo",
// });
