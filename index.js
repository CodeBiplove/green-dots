const fs = require('fs');
const moment = require('moment');
const simpleGit = require('simple-git');

const FILE_PATH = './output.md';
let count = 0;

const makeCommitsForDate = (date, numCommits) => {
    if (numCommits === 0) {
        return Promise.resolve();
    }

    const commitMessage = ".";
    fs.appendFileSync(FILE_PATH, commitMessage + '\n');

    const git = simpleGit();
    const formattedDate = date.format();

    return new Promise((resolve, reject) => {
        git.add([FILE_PATH]).commit(commitMessage, {'--date': formattedDate}, (error) => {
            if (error) {
                reject(error);
            } else {
                console.log(count++);
                resolve();
            }
        });
    }).then(() => makeCommitsForDate(date, --numCommits));
};

const makeCommitsInRange = (startDate, endDate, numCommitsPerDate) => {
    const currentDate = moment(startDate);
    const lastDate = moment(endDate);

    const processNextDate = () => {
        if (currentDate.isAfter(lastDate)) {
            return simpleGit().push();
        }

        return makeCommitsForDate(currentDate, numCommitsPerDate)
            .then(() => {
                currentDate.add(1, 'days');
                return processNextDate();
            });
    };

    return processNextDate();
};

makeCommitsInRange('1969-01-01', '1969-01-05', 1) 
    .then(() => console.log('Commits completed'));