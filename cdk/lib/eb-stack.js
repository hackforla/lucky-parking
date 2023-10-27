const cdk = require("aws-cdk-lib");
const eb = require("aws-cdk-lib/aws-elasticbeanstalk");
const s3Assets = require("aws-cdk-lib/aws-s3-assets");
const { EcrDockerStack } = require("./docker-stack");
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

    // Define an Elastic Beanstalk Application
    const ebApplication = new eb.CfnApplication(this, "MyApplication", {
      applicationName: "MyApplication",
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
