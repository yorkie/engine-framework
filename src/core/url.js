/**
 * @class url
 * @static
 */
Fire.url = {

    /**
     * The base url of raw files.
     * @property rawUrl
     * @readOnly
     */
    rawUrl: '',

    /**
     * Returns the url of raw files.
     * @method raw
     * @param {string} path
     * @return {string} raw url
     * @example
var url = Fire.url.raw("myTexture.png");
console.log(url);   // "resources/raw/myTexture.png"
     */
    raw: function (url) {
        if (url[0] === '.' && url[1] === '/') {
            url = url.slice(2);
        }
        else if (url[0] === '/') {
            url = url.slice(1);
        }
        return this.rawUrl + url;
    }
};

module.exports = Fire.url;
