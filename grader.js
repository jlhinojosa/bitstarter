#!/usr/bin/env node

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://fathomless-everglades-2214.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};


var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

var checkFile = function(file, checks) {
    var checkJson = checkHtmlFile(file, checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
};

var checkUrl = function(url, checks) {
    var inner = function(result, response) {
        fs.writeFileSync('downloaded.html', result);
        var file = assertFileExists('downloaded.html');
        var checkJson = checkHtmlFile(file, checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    };

    rest.get(url).on('complete', inner);
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
        .option('-u, --url <url_path>', 'URL to findex.html')
        .parse(process.argv);

    if(program.file) checkFile(program.file, program.checks);
    if(program.url)  checkUrl(program.url, program.checks);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
