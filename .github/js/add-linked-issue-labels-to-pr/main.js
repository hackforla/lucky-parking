var github
var context
const findLinkedIssue = require('../utils/find-linked-issue.js')

/**
 * 
 */
function main({g, c}) {
  github = g
  context = c
  console.log('issue num:', context.payload.issue.number)
  console.log('payload:', context.payload)
  // figure out json tree for either github or context go get PR number
  // otherwise pull it from the env outside the js file


  // console.log(github.event.pull_request)
  // const body = github.event.pull_request.body 
  // const prNumber = github.event.number

  // const issueNumber = findLinkedIssue(body)
  // console.log(issueNumber)
  // return issueNumber
}

module.exports = main