# Redivis technical mini-project
Congratulations for making it to the technical interview step in the Redivis [hiring process](https://handbook.redivis.com/jobs/hiring-process)! We'd like to get to know how you **review code** and how you **write code**, so we've put together a two-part assignment, centered around a data viewer implemented in this repo. This is a simplified version of the [live Redivis data viewer](https://redivis.com/Demo/datasets/1709/tables?table=82661#cells), which allows researchers to quickly scan across billions of records in a table.

This mini-project will also serve as a catalyst for further discussion during our technical interview.

## Step 1: Review our pull request
First, we'd like you to review some code, submitted by another frontend engineer, that has a few issues and points of discussion.

Please briefly review the open pull request on this repo, leaving comments (and questions) about the code organization, decomposition, variable/function naming conventions, etc.

Note: for this step, there's no need to submit any code (other than perhaps small snippets in the PR review comments); we're just asking you to review the content of the pull request.

## Step 2: Update the code to fetch data from the Redivis API
Next, put on your developer hat, and update the table viewer to show data from the [U.S. Fires Compiled Dataset](https://redivis.com/Demo/datasets/1667/tables?table=74304#cells) table on Redivis.

Please create a new branch from the PR branch above, and submit a pull request to update the `rowGetter` function (in `javascripts/CellsList/TableCache.js`) to fetch data via the Redivis API, as described in issue #3 in this repo.

Note that we recommend spending no more than ~2 hours on this whole project - so we encourage you to submit pseudocode to describe your approach if you can't get everything working!

## Installation & running
To run the table viewer application on your computer, use the following steps:
1. Clone the repository to a directory on your local machine
2. Install by navigating to the above directory and running `npm install`
3. Start the application by running `npm start`
4. Navigate to http://localhost:9000 (or http://127.0.0.1:9000)


## Questions?
Send me an email (sean@redivis.com) if you have any questions!
