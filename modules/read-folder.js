var fs = require('fs');

module.exports = function(app) {
    return function(folder, processFile, callback) {
        var files = fs.readdirSync(folder).sort();
        function readFile(n) {
            if (n === files.length) {
                callback(files);
            } else {
                if (files[n].indexOf(".") === 0) {
                    return readFile(++n);
                }
                fs.readFile(folder + files[n], 'utf8', function(err, data) {
                    var next = function() {
                        readFile(n + 1);
                    };
                    processFile(err, data, next, files[n]);
                });
            }
        }
        readFile(0);
    };
};