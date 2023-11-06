const cdk = require("aws-cdk-lib");
const eb = require("aws-cdk-lib/aws-elasticbeanstalk");
const s3 = require("aws-cdk-lib/aws-s3");
const s3Assets = require("aws-cdk-lib/aws-s3-assets");
// const { EcrDockerStack } = require("./docker-stack");
const iam = require("aws-cdk-lib/aws-iam");
const path = require("path");

class MyElasticBeanstalkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    console.log("Environment Variables:", {
      WEBSITE_URI: process.env.WEBSITE_URI,
      DOCKERRUN_BUCKET_NAME: process.env.DOCKERRUN_BUCKET_NAME,
      DOCKERRUN_S3_KEY: process.env.DOCKERRUN_S3_KEY,
    });

    const dockerrunBucket = s3.Bucket.fromBucketAttributes(this, "ImportedBucket", {
      bucketName: process.env.DOCKERRUN_BUCKET_NAME,
    });

    const ebRole = new iam.Role(this, "EBInstanceRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    const ebInstanceProfile = new iam.CfnInstanceProfile(this, "EBInstanceProfile", {
      roles: [ebRole.roleName],
    });

    const dockerrunS3Key = process.env.DOCKERRUN_S3_KEY;

    dockerrunBucket.grantRead(ebRole); // Grant the EB role read access to the bucket

    // Define an Elastic Beanstalk Application
    const ebApplication = new eb.CfnApplication(this, "MyApplication", {
      applicationName: "MyApplication",
    });

    new eb.CfnApplicationVersion(this, "MyAppVersion", {
      applicationName: ebApplication.applicationName,
      sourceBundle: {
        s3Bucket: process.env.DOCKERRUN_BUCKET_NAME,
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
