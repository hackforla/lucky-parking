/**
 * Global Variables
 */
var github
var context
const artifacts = require('../../utils/artifacts.js')
 
 /**
  * Downloads the artifact from the previous workflow
  * @param {Object} g - github object  
  * @param {Object} c - context object 
  * @param {String} workspace - the current GitHub workspace directory path
  */
function main({g, c}, workspace) {
  github = g
  context = c
  const zipName = 'add-linked-issue-labels-to-pr'
  artifacts.downloadArtifact(github, context, workspace, zipName)
}
 
module.exports = main