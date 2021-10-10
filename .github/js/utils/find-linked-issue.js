/*
  Initial source: https://github.com/hackforla/website/blob/gh-pages/github-actions/utils/find-linked-issue.js
*/
function findLinkedIssue(text) {
    // Create RegEx for capturing KEYWORD #ISSUE-NUMBER syntax
    const KEYWORDS = ['close', 'closes', 'closed', 'fix', 'fixes', 'fixed', 'resolve', 'resolves', 'resolved']
    // let reArr = []
    // for (const word of KEYWORDS) {
    //     reArr.push(`[\\n|\\s|^]${word} #\\d+\\s|^${word} #\\d+\\s|\\s${word} #\\d+$|^${word} #\\d+$`)
    // }
    const reArr = KEYWORDS.map(word => `[\\n|\\s|^]${word} #\\d+\\s|^${word} #\\d+\\s|\\s${word} #\\d+$|^${word} #\\d+$`)

    // Receive and unpack matches into an Array of Array objs
    const re = new RegExp(reArr.join('|'), 'gi')
    const matches = [...text.matchAll(re)]
    // matches = [...matches]

    // If only one match is found, return the issue number. Else return false. Also console.log results.
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