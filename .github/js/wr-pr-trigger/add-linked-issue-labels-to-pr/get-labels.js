/**
 * Global Variables
 */
 var github
 var context
 const artifacts = require('../../utils/artifacts.js')
 const labelsAPI = require('../../utils/labels.js')
  
/**
 * Parses the Pull Request body for a linked issue, and returns it
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @param {String} workspace - the current GitHub workspace directory path
 * @returns - an object that contains the PR number and an array of labels
 */
async function main({g, c}, workspace) {
  github = g 
  context = c
  const fileName = `${workspace}/artifact.txt`
  const artifactJSON = JSON.parse(artifacts.readArtifact(fileName))

  // End action of previous action did not yield a proper issue number
  if (artifactJSON.status === 'Failed') {
    console.log ('Please check the previous action, Retrieve Linked Issue From PR, to see why it failed.')
    return {
      status: 'Failed',
      prNumber: null,
      labels: null
    }
  }

  const issueNum = artifactJSON.issueNumber
  const prNum = artifactJSON.prNumber
  const response = await labelsAPI.listLabelsOnIssue(github, context, issueNum)

  const labels = response.map(data => data.name)
  console.log(`Labels found on issue: ${labels.join(', ')}`)
  return {
    status: 'Success',
    prNumber: prNum,
    labels: labels
  }
 }
  
 module.exports = main