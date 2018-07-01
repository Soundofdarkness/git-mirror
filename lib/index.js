const fs = require("fs");
const path = require("path");
const logger = require("debug");
const Mirror = require("./Mirror");

/**
 * Controls a set of mirrors specified in ../config.config.json
 * @author Laurelianae
 * @class GitMirror
 */
class GitMirror{

    /**
     * Creates an instance of GitMirror.
     * @memberof GitMirror
     */
    constructor(){
        this.debug = logger("Git-Mirror:Main");
        this.pkg = require("../package.json");
        this.config = null;
        this.mirrors = [];
    }


    /**
     * Loads config and starts the @see Mirror instances
     * @function init
     * @returns
     * @memberof GitMirror
     */
    init(){
        //Loading Config
        try {
            this.debug("Attempting to load config...");
            this.config = JSON.parse(fs.readFileSync(path.resolve(path.join("./", "config", "config.json"))));
            this.debug("Config loaded sucessfully");
        }
        catch(err){
            this.debug("Unexpected error while loading config: ", err);
        }
        const reload = (this.config.timeout * 1000) || null;
        if(reload === null){
            this.debug("No timeout for repo-refresh given. Please add the timeout to your config.json.");
            process.exit(1);
            return;
        }
        const repos = this.config.repositories || null;
        if(repos === null){
            this.debug("No repositories for mirror configured. Please add the repositories you want to mirror to your config.json .");
            process.exit(1);
        }
        // Config checking done

        this.debug("Loaded ", repos.length, " repositories");
        this.debug("Refresh timeout", reload, "seconds");

        this.debug("Starting Git-Mirror v", this.pkg.version);
        this.debug("Author: Laureliane (Soundofdarkness)");
        this.debug("             <==*==>                ");
        for(const repo of repos){
            const name = repo.name;
            const url = repo.url;
            this.mirrors.push(new Mirror(url, name, reload));
        }

        this.debug("Git-Mirror online");

    }
}


module.exports = GitMirror;