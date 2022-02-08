# Contributing to the Lucky Parking Team

Welcome! First off, thank you for taking the time to contribute.

The following is a set of guidelines to contribute to the Lucky Parking repository. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a form of a pull request.

This document assumes you already learned about the team, and have gone through onboarding. Before we start, please make sure to read our [code of conduct](https://github.com/hackforla/codeofconduct), and enable [two-factor authentication for GitHub](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication). We require 2FA to be in place to contribute to the project.

## Branching Process
Our branching model is based off of this article on [succesful git branching](https://nvie.com/posts/a-successful-git-branching-model/).

### Main Branches
For development purposes, we have two core branches to be aware of: `master` and `dev`. The `master` branch will always reflect the production-ready state of the website, and the `dev` branch will always reflect the state with the latest delivered development changes.

We will treat the `dev` branch as the main contribution branch. When working on new issues, developers should checkout their branch off of `dev` and make Pull Requests to `dev`. Once the `dev` branch have code that is ready to be rolled to production, we will create a release branch where we stabilize the code, and eventually push to `master`. Pushes to `master` outside of release branches would be limited, and mostly will be handled by administrators.

## Setting up your local dev environment
We are currently in the process of dockerizing the backend of the application to ease the workflow for developers. Before that, please follow this [wiki article](https://github.com/hackforla/lucky-parking/wiki/Developer-Contributing-Guide#using-git) on setting up your environment.
