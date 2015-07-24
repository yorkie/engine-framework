
// 不能使用于get方法的属性
var _propertyNotForGet = [
    'default',
    'serializable',
    'editorOnly',
    'rawType'
];

// 预处理 notify 等扩展属性
function parseNotify (val, propName, notify, properties) {
    if (val.get || val.set) {
        if (FIRE_DEV) {
            Fire.warn('"notify" can\'t work with "get/set" !');
        }
        return;
    }
    if (val.hasOwnProperty('default')) {
        // 添加新的内部属性，将原来的属性修改为 getter/setter 形式
        // 以 _ 开头将自动设置property 为 Fire.HideInInspector
        var newKey = "_valOf$" + propName;

        val.get = function () {
            return this[newKey];
        };
        val.set = function (value) {
            var oldValue = this[newKey];
            this[newKey] = value;
            notify.call(this, oldValue);
        };

        var newValue = {};
        properties[newKey] = newValue;
        // 将不能用于get方法中的属性移动到newValue中
        for (var i = 0; i < _propertyNotForGet.length; i++) {
            var prop = _propertyNotForGet[i];
            if (val.hasOwnProperty(prop)) {
                newValue[prop] = val[prop];
                delete val[prop];
            }
        }
    }
    else if (FIRE_DEV) {
        Fire.warn('"notify" must work with "default" !');
    }
}

// auto set wrapper's type
function parseWrapper (val, propName, wrapperOf, classname) {
    if (val.type) {
        Fire.warn('The "wrapper" attribute of %s.%s can not be used with "type"', classname, propName);
    }
    if (Fire.isChildClassOf(wrapperOf, Fire.Runtime.NodeWrapper)) {
        val.type = wrapperOf;
        return;
    }
    var wrapper = Fire.getWrapperType(wrapperOf);
    if (wrapper) {
        val.type = wrapper;
    }
    else {
        Fire.warn('Can not declare "wrapper" attribute for %s.%s, the registered wrapper of "%s" is not found.',
            name, propName, Fire.JS.getClassName(wrapperOf));
    }
}

function createUuidAdapter (val, propName, type, properties, def) {
    if (FIRE_EDITOR) {
        // hide original asset in Inspector
        val.visible = false;
        var originDisplayName = val.displayName;
        if (originDisplayName) {
            delete val.displayName;
        }
        // create an adapter field which actual value is uuid for Inspector
        var uuidKey = "_idOf$" + propName;
        var uuidDef = def;
        uuidDef.displayName = originDisplayName ||
                              (typeof EditorUI !== 'undefined' && EditorUI.toHumanText(propName)) ||
                              propName;
        uuidDef.visible = true;
        uuidDef.type = type;
        properties[uuidKey] = uuidDef;
    }
}

function parseAssetType (val, propName, type, properties) {
    if (FIRE_EDITOR) {
        createUuidAdapter(val, propName, type, properties, {
            get: function () {
                var asset = this[propName];
                return asset ? asset._uuid : '';
            },
            set: function (value) {
                if (value) {
                    var self = this;
                    Fire.AssetLibrary.loadAsset(value, function (err, asset) {
                        if (asset) {
                            if (!(asset instanceof type)) {
                                Fire.error('The new %s must be %s', propName, Fire.JS.getClassName(type));
                            }
                        }
                        self[propName] = asset;
                    });
                }
                else {
                    this[propName] = null;
                }
            }
        });
    }
}

// create an adapter field which actual value is uuid for inspector
function parseAssetUrl (val, propName, typeOfUrl, properties, classname) {
    if (FIRE_EDITOR) {
        if (typeof typeOfUrl !== 'function' || !Fire.isChildClassOf(typeOfUrl, Fire.Asset)) {
            Fire.error('The "url" type of "%s.%s" must be child class of Fire.Asset.', classname, propName);
            return;
        }
        createUuidAdapter(val, propName, typeOfUrl, properties, {
            get: function () {
                var url = this[propName];
                return (url && Fire.Asset.urlToUuid(url)) || '';
            },
            set: function (value) {
                if (value) {
                    var self = this;
                    Fire.AssetLibrary.loadAsset(value, function (err, asset) {
                        if (asset) {
                            if (!(asset instanceof typeOfUrl)) {
                                Fire.error('The new %s must be %s', propName, Fire.JS.getClassName(typeOfUrl));
                            }
                        }
                        self[propName] = (asset && asset.url) || '';
                    });
                }
                else {
                    this[propName] = '';
                }
            }
        });
    }
    // create setter used after loaded from asset library
    var setterKey = "_set$" + propName;
    var setterDef = {
        set: function (asset) {
            if (asset) {
                this[propName] = asset.url;
            }
        }
    };
    properties[setterKey] = setterDef;
}

module.exports = function (properties, classname) {
    for (var propName in properties) {
        var val = properties[propName];
        if (val) {
            var notify = val.notify;
            if (notify) {
                parseNotify(val, propName, notify, properties);
            }
            var wrapperOf = val.wrapper;
            if (wrapperOf) {
                parseWrapper(val, propName, wrapperOf, classname);
            }
            if (FIRE_EDITOR) {
                var type = val.type;
                if (typeof type === 'function' && Fire.isChildClassOf(type, Fire.Asset)) {
                    parseAssetType(val, propName, type, properties);
                }
                var url = val.url;
                if (url) {
                    parseAssetUrl(val, propName, url, properties, classname);
                }
            }
        }
    }
};
