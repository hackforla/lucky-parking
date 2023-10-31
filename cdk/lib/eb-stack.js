const cdk = require("aws-cdk-lib");
const eb = require("aws-cdk-lib/aws-elasticbeanstalk");
const s3 = require("aws-cdk-lib/aws-s3");
const s3Assets = require("aws-cdk-lib/aws-s3-assets");
// const { EcrDockerStack } = require("./docker-stack");
const iam = require("aws-cdk-lib/aws-iam");

class MyElasticBeanstalkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const ebRole = new iam.Role(this, "EBInstanceRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    const ebInstanceProfile = new iam.CfnInstanceProfile(this, "EBInstanceProfile", {
      roles: [ebRole.roleName],
    });

    // Creates an S3 bucket to store Dockerrun file which points to Docker image on ECR
    const dockerrunBucket = new s3.Bucket(this, "DockerrunBucket");

    // adds the Dockerrun file into the S3 bucket
    const dockerrunAsset = new s3Assets.Asset(this, "DockerrunAsset", {
      path: path.join(__dirname, "../Dockerrun.aws.json"),
    });

    const dockerrunS3Key = dockerrunAsset.s3ObjectKey;

    dockerrunBucket.grantRead(ebRole); // Grant the EB role read access to the bucket

    // Define an Elastic Beanstalk Application
    const ebApplication = new eb.CfnApplication(this, "MyApplication", {
      applicationName: "MyApplication",
    });

    new eb.CfnApplicationVersion(this, "MyAppVersion", {
      applicationName: ebApplication.applicationName,
      sourceBundle: {
        s3Bucket: dockerrunBucket.bucketName,
        s3Key: dockerrunS3Key,
      },
    });

    ebRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: [
          "elasticbeanstalk:*",
          "ec2:*",
          "elasticloadbalancing:*",
          "autoscaling:*",
          "cloudwatch:*",
          "s3:*",
          "sns:*",
          "cloudformation:*",
          "rds:*",
          "sqs:*",
          "ecs:*",
          // Add other permissions as necessary
        ],
      }),
    );

    // Create Elastic Beanstalk environment inside the application
    new eb.CfnEnvironment(this, "MyEnvironment", {
      environmentName: "MyEnvironment",
      applicationName: ebApplication.applicationName,
      solutionStackName: "64bit Amazon Linux 2023 v4.1.0 running Docker",
      optionSettings: [
        {
          namespace: "aws:autoscaling:launchconfiguration",
          optionName: "IamInstanceProfile",
          value: ebInstanceProfile.ref,
        },
      ],
    });
  }
}

module.exports = { MyElasticBeanstalkStack };
