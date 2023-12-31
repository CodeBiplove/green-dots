const fs = require('fs');
const moment = require('moment');
const simpleGit = require('simple-git');
const readlineSync = require('readline-sync');

const FILE_PATH = './output.md';
let count = 0;

const makeCommitsForDate = (date, name, numCommits) => {
    if (numCommits === 0) {
        return Promise.resolve();
    }

    const commitMessage = `Contribution by ${name}.`;
    fs.appendFileSync(FILE_PATH, commitMessage + '\n');

    const git = simpleGit();
    const formattedDate = date.format();

    return new Promise((resolve, reject) => {
        git.add([FILE_PATH]).commit(commitMessage, { '--date': formattedDate }, (error) => {
            if (error) {
                reject(error);
            } else {
                console.log(count++);
                resolve();
            }
        });
    }).then(() => makeCommitsForDate(date, name, --numCommits));
};

const makeCommitsInRange = (startYear, name, numCommitsPerDate) => {
    const startDate = moment(`${startYear}-01-01`);
    const endDate = moment(`${startYear}-12-31`);

    const currentDate = moment(startDate);

    const processNextDate = () => {
        if (currentDate.isAfter(endDate)) {
            return simpleGit().push();
        }

        return makeCommitsForDate(currentDate, name, numCommitsPerDate)
            .then(() => {
                currentDate.add(1, 'days');
                return processNextDate();
            });
    };

    return processNextDate();
};

// Prompt user for name and start year
const name = readlineSync.question('Enter your name: ');
const startYear = readlineSync.questionInt('Enter the start year: ');

makeCommitsInRange(startYear, name, 1)
    .then(() => console.log('Commits completed'));
