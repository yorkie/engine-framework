﻿/**
 * The utils for path operation
 * @class Path
 * @static
 */
if (Fire.isNode) {
    Fire.Path = require('path');
}
else {
    // implement a simple fallback if node not available
    Fire.Path = (function () {

        var splitPath;
        if (Fire.isWin32) {
            // copied from node.js/lib/path.js
            // Regex to split a windows path into three parts: [*, device, slash,
            // tail] windows-only
            var splitDeviceRe =
                /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

            // Regex to split the tail part of the above into [*, dir, basename, ext]
            var splitTailRe =
                /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;

            // Function to split a filename into [root, dir, basename, ext]
            // windows version
            splitPath = function(filename) {
                // Separate device+slash from tail
                var result = splitDeviceRe.exec(filename),
                    device = (result[1] || '') + (result[2] || ''),
                    tail = result[3] || '';
                // Split the tail into dir, basename and extension
                var result2 = splitTailRe.exec(tail),
                    dir = result2[1],
                    basename = result2[2],
                    ext = result2[3];
                return [device, dir, basename, ext];
            };
        }
        else {
            // copied from node.js/lib/path.js
            // Split a filename into [root, dir, basename, ext], unix version
            // 'root' is just a slash, or nothing.
            var splitPathRe =
                /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
            splitPath = function(filename) {
                return splitPathRe.exec(filename).slice(1);
            };
        }

        var Path = {
            /**
             * Return the last portion of a path.
             * @method basename
             * @param {string} path
             * @return {string}
             *
             * @example
    path.basename('/foo/bar/baz/asdf/quux.html')    // returns 'quux.html'
             */
            basename: function (path) {
                return path.replace(/^.*(\\|\/|\:)/, '');
            },

            /**
             * Return the extension of the path, from the last '.' to end of string in the last portion of the path.
             * If there is no '.' in the last portion of the path or the first character of it is '.',
             * then it returns an empty string.
             *
             * @method extname
             * @param {string} path
             * @return {string}
             *
             * @example
path.extname('index.html')      // returns '.html'
path.extname('index.coffee.md') // returns '.md'
path.extname('index.')          // returns '.'
path.extname('index')           // returns ''
             */
            extname: function (path) {
                path = Path.basename(path);
                return path.substring((~-path.lastIndexOf(".") >>> 0) + 1);
            },

            /**
             * Return the directory name of a path.
             *
             * @method dirname
             * @param {string} path
             * @return {string}
             *
             * @example
path.dirname('/foo/bar/baz/asdf/quux') // returns '/foo/bar/baz/asdf'
             */
            dirname: function (path) {
                // copied from node.js/lib/path.js
                var result = splitPath(path),
                    root = result[0],
                    dir = result[1];

                if (!root && !dir) {
                    // No dirname whatsoever
                    return '.';
                }

                if (dir) {
                    // It has a dirname, strip trailing slash
                    dir = dir.substr(0, dir.length - 1);
                }

                return root + dir;
            },

            /**
             * The platform-specific file separator. '\\' or '/'.
             * @property sep
             * @type {string}
             * @default windows: "\", mac: "/"
             * @readOnly
             */
            sep: (Fire.isWin32 ? '\\' : '/')
        };
        return Path;
    })();
}

/**
 * @method setExtname
 * @param {string} path
 * @param {string} newExtension - extension to replace with
 * @return {string} result
 */
Fire.Path.setExtname = function (path, newExtension) {
    // if (Fire.isNode) return Path.join(Path.dirname(path), Path.basename(path, Path.extname(path))) + newExtension;
    var dotIndex = (~-path.lastIndexOf(".") >>> 0) + 1;
    return path.substring(0, dotIndex) + newExtension;
};

/**
 * @method setEndWithSep
 * @param {string} path
 * @param {boolean} [endWithSep = true]
 * @param {string} [sep = Fire.Path.sep]
 * @return {string} result
 */
Fire.Path.setEndWithSep = function (path, endWithSep, sep) {
    endWithSep = (typeof endWithSep !== 'undefined') ? endWithSep : true;

    var endChar = path[path.length - 1];
    var oldEndWithSep = (endChar === '\\' || endChar === '/');
    if (!oldEndWithSep && endWithSep) {
        path += (sep || Fire.Path.sep);
    }
    else if (oldEndWithSep && !endWithSep) {
        path = path.slice(0, -1);
    }
    return path;
};
