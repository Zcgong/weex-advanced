var path = require('path');
var fs = require('fs');

var entry = {};

function walk(dir) {
    dir = dir || '.'
    var directory = path.join(__dirname, '../project', dir);
    fs.readdirSync(directory)
        .forEach(function(file) {
            var fullpath = path.join(directory, file);
            var stat = fs.statSync(fullpath);
            var extname = path.extname(fullpath);
            if (stat.isFile() && extname === '.we') {
                var name = path.join('project', 'build', dir, path.basename(file, extname));
                entry[name] = fullpath + '?entry=true';
            } else if (stat.isDirectory() && file !== 'build' && file !== 'include') {
                var subdir = path.join(dir, file);
                walk(subdir);
            }
        });
}

walk();

module.exports = {
    entry: entry,
    resolve: {
        alias: {
            ui: path.resolve(__dirname, '../project/src/ui'),
            util: path.resolve(__dirname, '../project/src/util'),
        }
    },
    output: {
        path: '.',
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.we(\?[^?]+)?$/,
            loaders: ['weex-loader']
        }
        // , {
        //     test: /\.js(\?[^?]+)?$/,
        //     loaders: ['weex-loader?type=script']
        // }
      ]
    }
}
