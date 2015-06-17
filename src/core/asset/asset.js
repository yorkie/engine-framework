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
         * Returns the url of this asset's raw file, if extname of raw file is omitted,
         * it will returns the url of the serialized asset.
         * @property url
         * @type {string}
         * @readOnly
         */
        url: {
            get: function () {
                if (Fire.AssetLibrary) {
                    var url = Fire.AssetLibrary.getUrl(this._uuid);
                    var ext = this._rawExt;
                    return ext ? url + '.' + ext : url;
                }
                else {
                    Fire.error('asset.url is not usable in core process');
                }
                return '';
            },
            visible: false
        },

        /**
         * 在 lite 版的 Fireball 里，raw asset 并不仅仅是在 properties 里声明了 rawType 才有，
         * 而是每个 asset 都能指定自己的 raw file url。但 AssetLibrary 并不会帮你加载这个 url，除非你声明了 rawType。
         * @property _rawExt
         * @type {string}
         * @default ''
         * @private
         */
        _rawExt: ''
    },

    statics: {
        /**
         * Checks if this type asset can be created from given asset file. (Without actually creating the asset).
         * @method validateAsset
         * @param {string} fsPath - file system path of the asset file in asset database
         * @return {boolean}
         */
        validateAsset: function (fsPath) {
            return true;
        },

        /**
         * 这个方法给 AssetDB 专用，或许能让 AssetDB 不耦合 Editor.serialize()。
         * @method serialize
         * @return {string}
         * @private
         */
        serialize: function () {
            return Editor.serialize(this);
        },

        /**
         * 这个方法给 AssetDB 专用，或许能让 AssetDB 不耦合 Fire.deserialize()。
         * @method deserialize
         * @param {string} data
         * @return {Asset}
         * @private
         */
        deserialize: function (data) {
            return Fire.deserialize(data);
        },

        urlToUuid: function (url) {
            if (Fire.AssetLibrary) {
                var uuid = Fire.AssetLibrary.getUuid(url);
                return uuid;
            }
            else {
                Fire.error('Asset.urlToUuid is not usable in core process');
            }
            return '';
        }
    },

    /**
     * Create a new node using this asset in the scene.
     * If this type of asset dont have corresponding type of node, this method should be null.
     * @createNode createNode
     * @param {function} callback
     * @param {string} callback.error - null or the error info
     * @param {object} callback.node - the created node or null
     */
    createNode: null,

    /**
     * Set raw extname for this asset.
     * @method _setRawExtname
     * @param {string} extname
     * @private
     */
    _setRawExtname: function (extname) {
        if (extname.charAt(0) === '.') {
            extname = extname.slice(1);
        }
        this._rawExt = extname;
    }
});

