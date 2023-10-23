const cdk = require("aws-cdk-lib");
const eb = require("aws-cdk-lib/aws-elasticbeanstalk");
const s3Assets = require("aws-cdk-lib/aws-s3-assets");
const { EcrDockerStack } = require("./docker-stack");

class MyElasticBeanstalkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Define an Elastic Beanstalk Application
    const ebApplication = new eb.CfnApplication(this, "MyApplication", {
      applicationName: "MyApplication",
    });

    // Create an S3 bucket to store the Dockerrun.aws.json file
    const asset = new s3Assets.Asset(this, "MyAsset", {
      path: "../Dockerrun.aws.json",
    });

    // Create Elastic Beanstalk environment inside the application
    new eb.CfnEnvironment(this, "MyEnvironment", {
      environmentName: "MyEnvironment",
      applicationName: ebApplication.applicationName,
      solutionStackName: "64bit Amazon Linux 2 v3.4.1 running Docker",
      optionSettings: [
        {
          namespace: "aws:elasticbeanstalk:application:environment",
          optionName: "WEBSITE_URI",
          value: props.WEBSITE_URI, // Use the WEBSITE_URI passed in via props
        },
      ],
      // If you've uploaded the Dockerrun.aws.json to S3, you can specify the S3 URL here
      sourceBundle: {
        s3Bucket: asset.s3BucketName,
        s3Key: asset.s3ObjectKey,
      },
    });
  }
}

module.exports = { MyElasticBeanstalkStack };
