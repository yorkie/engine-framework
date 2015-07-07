var FObject = require('../fobject');

/**
 * Base class for asset handling.
 *
 * You should override:
 * - validateAsset (static)
 *
 * You may want to override:
 * - createNode
 * - Fire.FObject._serialize
 * - Fire.FObject._deserialize
 *
 * @class Asset
 * @extends Object
 * @constructor
 */
module.exports = Fire.Class({
    name: 'Fire.Asset', extends: FObject,

    constructor: function () {
        /**
         * @property _uuid
         * @type {string}
         * @private
         */
        Object.defineProperty(this, '_uuid', {
            value: '',
            writable: true,
            enumerable: false   // avoid uuid being assigned to empty string during destroy,
        });

        ///**
        // * @property dirty
        // * @type boolean
        // * @private
        // */
        //this.dirty = false;
    },

    properties: {
        /**
         * Returns the url of this asset's first raw file, if none of rawFile exists,
         * it will returns the url of this serialized asset.
         * @property url
         * @type {string}
         * @readOnly
         */
        url: {
            get: function () {
                if (this._rawFiles) {
                    if (Fire.AssetLibrary) {
                        var url = Fire.AssetLibrary.getRawBase(this._uuid);
                        var filename = this._rawFiles[0];
                        return Fire.Path.join(url, filename);
                    }
                    else {
                        Fire.error('asset.url is not usable in core process');
                    }
                }
                return '';
            },
            visible: false
        },

        /**
         * Returns the url of this asset's raw files, if none of rawFile exists,
         * it will returns an empty array.
         * @property urls
         * @type {string[]}
         * @readOnly
         */
        urls: {
            get: function () {
                if (this._rawFiles) {
                    if (Fire.AssetLibrary) {
                        var url = Fire.AssetLibrary.getRawBase(this._uuid);
                        return this._rawFiles.map(function (ext) {
                            return ext ? url + '.' + ext : url;
                        });
                    }
                    else {
                        Fire.error('asset.urls is not usable in core process');
                    }
                }
                return [];
            },
            visible: false
        },

        /**
         * 在 lite 版的 Fireball 里，raw asset 并不仅仅是在 properties 里声明了 rawType 才有，
         * 而是每个 asset 都能指定自己的 raw file url。但 AssetLibrary 并不会帮你加载这个 url，除非你声明了 rawType。
         * @property _rawFiles
         * @type {string[]}
         * @default null
         * @private
         */
        _rawFiles: null
    },

    statics: {
        /**
         * 这个方法给 AssetDB 专用，或许能让 AssetDB 不耦合 Fire.deserialize()。
         * @method deserialize
         * @param {string} data
         * @return {Asset}
         * @static
         * @private
         */
        deserialize: function (data) {
            return Fire.deserialize(data);
        },

        urlToUuid: function (url) {
            if (Fire.AssetLibrary) {
                if (url) {
                    var uuid = Fire.AssetLibrary.getUuid(url);
                    return uuid;
                }
            }
            else {
                Fire.error('Asset.urlToUuid is not usable in core process');
            }
            return '';
        }
    },

    /**
     * 这个方法为了让 AssetDB 不耦合 Editor.serialize()。
     * @method serialize
     * @return {string}
     * @private
     */
    serialize: function () {
        return Editor.serialize(this);
    },

    /**
     * Create a new node using this asset in the scene.
     * If this type of asset dont have corresponding type of node, this method should be null.
     * @method createNode
     * @param {function} callback
     * @param {string} callback.error - null or the error info
     * @param {object} callback.node - the created node or null
     */
    createNode: null,

    /**
     * Set raw extname for this asset.
     * @method _setRawFiles
     * @param {string[]} rawFiles
     * @private
     */
    _setRawFiles: function (rawFiles) {
        rawFiles = rawFiles.map(function (item) {
            if (item.charAt(0) === '.') {
                item = item.slice(1);
            }
            return item;
        });
        this._rawFiles = rawFiles.length > 0 ? rawFiles : null;
    }
});

