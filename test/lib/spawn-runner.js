// so as to run tests in page-level

if (Fire.isCoreLevel) {
    var Ipc = require('ipc');
    var Path = require('path');
    var Url = require('url');
    var BrowserWindow = require('browser-window');

    module.exports = (function spawnWorker (title, scriptUrl) {

        describe(title, function () {
            var win;

            // close window afterward
            after(function ( done ) {
                win.once('closed', function () {
                    win = null;
                    done();
                });
                win.close();
            });

            //
            it('should running on page-level', function( done ) {
                this.timeout(0);
                Ipc.on('runner:end', function () {
                    done();
                });

                win = new BrowserWindow({
                    title: title,
                    width: 400,
                    height: 400,
                    show: true,
                });
                var query = {scriptUrl: scriptUrl};
                var url = Url.format({
                    protocol: 'file',
                    pathname: Path.resolve(__dirname, 'runner.html'),
                    slashes: true,
                    hash: encodeURIComponent(JSON.stringify(query))
                });
                win.loadUrl(url);
            });
        });
    });
}
else {
    module.exports = function () {

    };
}