#!/usr/bin/env node

const cdk = require("aws-cdk-lib");
const { EcrDockerStack } = require("../lib/docker-stack");
const { MyElasticBeanstalkStack } = require("../lib/eb-stack");

const app = new cdk.App();

// Initialize your Docker stack
const dockerStack = new EcrDockerStack(app, "MyEcrDockerStack");

// Initialize your Elastic Beanstalk stack
// You can also pass in properties from the Docker stack if needed
new MyElasticBeanstalkStack(app, "MyElasticBeanstalkStack", {
  websiteRepo: dockerStack.websiteEcrRepo,
});
