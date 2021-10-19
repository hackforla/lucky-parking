/** 
 * This file contains helper functions related to GitHub labels
*/

/**
 * Lists the labels attached to a GitHub issue
 * @param {Object} github - github object  
 * @param {Object} context - context object 
 * @param {string} issueNum - issue number
 * @returns - Returns an object of array data corresponding to the issue's labels
 */
 async function listLabelsOnIssue(github, context, issueNum) {
  // GET request to retrieve data from results of request
  // https://octokit.github.io/rest.js/v18#issues-list-labels-on-issue
  try {
    const response = await github.rest.issues.listLabelsOnIssue({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNum,
    })
    return response.data
  }
  catch(err) {
    console.log('Error with GET Request to get labels')
    console.log(err)
    return false
  }
}

/**
 * Lists the labels attached to a GitHub issue
 * @param {Object} github - github object  
 * @param {Object} context - context object 
 * @param {string} prNumber - PR number
 * @returns - Returns an API response object
 */
async function setLabels(github, context, prNumber, labels) {
  // PUT request to apply labels to pull request
  // https://octokit.github.io/rest.js/v18#issues-add-labels
  try {
    const response = await github.rest.issues.setLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: prNumber,
      labels: labels,
    })
    return response
  }
  catch(err) {
    console.log('Error with PUT Request to edit labels')
    console.log(err)
    return false
  }
}

module.exports = { 
  listLabelsOnIssue,
  setLabels
}