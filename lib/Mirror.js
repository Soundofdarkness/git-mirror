const git = require("nodegit");
const path = require("path");
const mkdirp = require("mkdirp");
const util = require("util");
const debug = require("debug");
const fs = require("fs");

/**
 * This Class automatically downloads a git repository,
 * checks for changes and updates the local copy in the given interval.
 * @author Laurelianae
 * @class Mirror
 */
class Mirror {
    /**
     * Creates an instance of Mirror.
     * @param {*} repourl Repository Url
     * @param {*} name Repository Name (for save folder and logger)
     * @param {*} interval Update check interval
     * @memberof Mirror
     */
    constructor(repourl, name, interval) {
        this.url = repourl;
        this.path = path.resolve(path.join("./", "repos", name, "/"));
        this.name = name;
        this.repo = null;
        this.debug = debug("Git-Mirror:" + name);
        this.update = null;
        this.init().then(() => {
            this.runner();

            this.update = setInterval(() => {
                this.runner();
            }, interval);

        })
    }

    /**
     * Initializes the repo for the specified Settings
     * @function init
     * @memberof GitMirror
     */
    async init() {
        this.debug("Starting initialization");
        if (!fs.existsSync(this.path)) {
            this.debug("Repo does not yet exist, cloning now ...");
            mkdirp.sync(this.path);
            let repo;
            try {
                // Fetch Opts ovveride for cert check, as its supposed to fail sometimes
                repo = await git.Clone(this.url, this.path, {
                    fetchOpts: {
                        certificateCheck: function () {
                            return 1;
                        }
                    }
                });
            }
            catch(err){
                this.debug("An unexpected error happened while trying to clone the repository: ", err);
                process.exit(1);
            }

            this.repo = repo;
            this.debug("Sucessfully cloned repository");

        }
        this.debug("Sucessfully initialized Repo Sync");
    }

    /**
     * Checks if repo has changes and downloads them
     * @function runner
     * @memberof GitMirror
     */
    runner() {
        let repository;
        git.Repository.open(this.path).then(repo => {
            repository = repo;
            return repo.fetchAll();
        }).then(() => {
            repository.mergeBranches("master", "origin/master");
        }).catch(err => {
            this.debug("Unexpected Error while updating Repository", err);
        }).done(() => {
            this.debug("Finished Updating Repository");
        })
    }

}

module.exports = Mirror;