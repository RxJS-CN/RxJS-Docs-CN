const fs = require('fs');
const path = require('path');
const validateMessage = require('validate-commit-msg');
const _ = require('lodash');

let errorCount = 0;

// Warn when PR size is large
const bigPRThreshold = 600;
if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
  warn(':exclamation: Big PR (' + ++errorCount + ')');
  markdown('> (' + errorCount + ') : Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR will helps faster, easier review.');
}

// Check test exclusion (.only) is included
const modifiedSpecFiles = danger.git.modified_files.filter(function (filePath) {
  return filePath.match(/.spec.(js|jsx|ts|tsx)$/gi);
});

const testFilesIncludeExclusion = modifiedSpecFiles.reduce(function (acc, value) {
  const content = fs.readFileSync(value).toString();
  const invalid =
    _.includes(content, 'it.only') || _.includes(content, 'describe.only')
  _.includes(content, 'fit(') || _.includes(content, 'fdescribe(');
  if (invalid) {
    acc.push(path.basename(value));
  }
  return acc;
}, []);

if (testFilesIncludeExclusion.length > 0) {
  fail('an \`only\` was left in tests (' + testFilesIncludeExclusion + ')');
}

//validate commit message in PR if it conforms conventional change log, notify if it doesn't.
const messageConventionValid = danger.git.commits.reduce(function (acc, value) {
  const valid = validateMessage(value.message);
  return valid && acc;
}, true);

if (!messageConventionValid) {
  fail('commit message does not follows conventional change log (' + ++errorCount + ')');
  markdown('> (' + errorCount + ') : RxJS uses conventional change log to generate changelog automatically. It seems some of commit messages are not following those, please check [contributing guideline](https://github.com/ReactiveX/rxjs/blob/master/CONTRIBUTING.md#commit-message-format) and update commit messages.');
}