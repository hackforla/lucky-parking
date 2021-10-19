/**
 * Global Variables
 */
 var github
 var context
 const labelsAPI = require('../../utils/labels.js')
  
/**
 * Adds labels to the corresponding PR
 * @param {Object} g - github object  
 * @param {Object} c - context object 
 * @param {String} prNumber - pull request number
 * @param {Array} labels - array of labels
 * @returns - returns a boolean based on the result
 */
async function main({g, c}, { status, prNumber, labels }) {
  github = g 
  context = c

  // End action if previous action's result is false
  if (status === 'Failed') {
    return false
  }

  const response = await labelsAPI.setLabels(github, context, prNumber, labels)

  console.log(response)
  if (response.status === 200){
    return true
  } else {
    return false
  }

 }
  
 module.exports = main