/**
 * Global Variables
 */
var github
var context
const findLinkedIssue = require('../../utils/find-linked-issue.js')

/**
 * Parses the Pull Request body for a linked issue, and returns it
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @returns - returns an object that contains the PR number and the linked issue number
 */
function main({g, c}) {
  github = g
  context = c
  const body = context.payload.pull_request.body
  const issueNum = findLinkedIssue(body)
  const status = issueNum === false ? 'Failed' : 'Success'
  const returnObj = {
    status: status,
    prNumber: context.payload.pull_request.number,
    issueNumber: issueNum
  }
  return JSON.stringify(returnObj)
}

module.exports = main