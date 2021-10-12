/*
  Initial source: https://github.com/hackforla/website/blob/gh-pages/github-actions/utils/find-linked-issue.js
*/

/**
 * Parses a text and returns any found linked issue
 * @param {string} text - Body of text from PR
 * @returns - Returns the issue number if found, or false
 */
function findLinkedIssue(text) {
  // Create RegEx for capturing KEYWORD #ISSUE-NUMBER syntax
  const KEYWORDS = ['close', 'closes', 'closed', 'fix', 'fixes', 'fixed', 'resolve', 'resolves', 'resolved']
  const reArr = KEYWORDS.map(word => `[\\n|\\s|^]${word} #\\d+\\s|^${word} #\\d+\\s|\\s${word} #\\d+$|^${word} #\\d+$`)

  // Receive and unpack matches into an Array of Array objs
  const re = new RegExp(reArr.join('|'), 'gi')
  const matches = [...text.matchAll(re)]

  /*
    This only allows for one linked issue to be solved per PRs
    because of the HFLA website team's contribution rules. 
    However, we may want to change this so PRs that don't have 
    any linked issues and PRs that solve multiple issues are taken into account
  */
  // Return a result only when there is one linked issue
  if (matches.length === 1) {
    const issueNumber = matches[0][0].match(/\d+/)
    console.log(`Issue number found: #${issueNumber}`)
    return issueNumber[0]
  } else {
    console.log(`Make sure there is only one issue!`)
    return false
  }
}

module.exports = findLinkedIssue