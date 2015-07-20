require('./attribute');
require('./class');
//var FObject = require('./fobject');
var getTypeChecker = require('./attribute').getTypeChecker;

// 不能使用于get方法的属性
var _propertyNotForGet = [
    'default',
    'serializable',
    'editorOnly',
    'rawType'
];

/**
 * !#en Defines a FireClass using the given specification, please see [Class](/en/scripting/class/) for details.
 * !#zh 定义一个 FireClass，传入参数必须是一个包含类型参数的字面量对象，具体用法请查阅[类型定义](/zh/scripting/class/)。
 *
 * @method Class
 * @param {object} options
 * @return {function} - the created class
 *
 * @example
    // define base class
    var Node = Fire.Class();

    // define sub class
    var Sprite = Fire.Class({
        name: 'Sprite',
        extends: Node,
        constructor: function () {
            this.url = "";
            this.id = 0;
        },

        properties {
            width: {
                default: 128,
                type: 'Integer',
                tooltip: 'The width of sprite'
            },
            height: 128,
            size: {
                get: function () {
                    return Fire.v2(this.width, this.height);
                }
            }
        },

        load: function () {
            // load this.url
        };
    });

    // instantiate

    var obj = new Sprite();
    obj.url = 'sprite.png';
    obj.load();

    // define static member

    Sprite.count = 0;
    Sprite.getBounds = function (spriteList) {
        // ...
    };
 */
Fire.Class = function (options) {
    if (arguments.length === 0) {
        return Fire.define();
    }
    if ( !options ) {
        Fire.error('[Fire.Class] Option must be non-nil');
        return Fire.define();
    }

    var name = options.name;
    var base = options.extends/* || FObject*/;
    var ctor = (options.hasOwnProperty('constructor') && options.constructor) || undefined;

    // create constructor
    var cls;
    //if (base) {
        if (name) {
            cls = Fire.extend(name, base, ctor);
        }
        else {
            cls = Fire.extend(base, ctor);
            name = Fire.JS.getClassName(cls);
        }
    //}
    //else {
    //    if (name) {
    //        cls = Fire.define(name, ctor);
    //    }
    //    else {
    //        cls = Fire.define(ctor);
    //        name = Fire.JS.getClassName(cls);
    //    }
    //}

    // define properties
    var properties = options.properties;
    if (properties) {

        // 预处理属性
        preParseProperties(name, properties);

        for (var propName in properties) {
            var val = properties[propName];
            var isObj = val && typeof val === 'object' && !Array.isArray(val);
            var isLiteral = isObj && val.constructor === ({}).constructor;
            if ( !isLiteral ) {
                val = {
                    default: val
                };
            }
            //var isValueType = typeof val.prototype.clone === 'function';
            //if (isValueType) {
            //    cls.prop(propName, val);
            //    continue;
            //}
            var attrs = parseAttributes(val, name, propName);
            if (val.hasOwnProperty('default')) {
                cls.prop.apply(cls, [propName, val.default].concat(attrs));
            }
            else {
                var getter = val.get;
                var setter = val.set;
                if (FIRE_EDITOR) {
                    if (!getter && !setter) {
                        Fire.error('Property %s.%s must define at least one of "default", "get" or "set".', name,
                            propName);
                    }
                }
                if (getter) {
                    cls.get.apply(cls, [propName, getter].concat(attrs));
                }
                if (setter) {
                    cls.set(propName, setter);
                }
            }
        }
    }

    // define statics
    var statics = options.statics;
    if (statics) {
        var staticPropName;
        if (FIRE_EDITOR) {
            var INVALID_STATICS = ['name', '__ctors__', '__props__', 'arguments', 'call', 'apply', 'caller', 'get',
                                   'getset', 'length', 'prop', 'prototype', 'set'];
            for (staticPropName in statics) {
                if (INVALID_STATICS.indexOf(staticPropName) !== -1) {
                    Fire.error('Cannot define %s.%s because static member name can not be "%s".', name, staticPropName,
                        staticPropName);
                    continue;
                }
            }
        }
        for (staticPropName in statics) {
            cls[staticPropName] = statics[staticPropName];
        }
    }

    // define functions
    var BUILTIN_ENTRIES = ['name', 'extends', 'constructor', 'properties', 'statics'];
    for (var funcName in options) {
        if (BUILTIN_ENTRIES.indexOf(funcName) !== -1) {
            continue;
        }
        var func = options[funcName];
        var type = typeof func;
        if (type === 'function' || func === null) {
            cls.prototype[funcName] = func;
        }
        else if (FIRE_EDITOR) {
            var TypoCheckList = {
                extend: 'extends',
                property: 'properties',
                static: 'statics'
            };
            var correct = TypoCheckList[funcName];
            if (correct) {
                Fire.warn('Unknown parameter of %s.%s, maybe you want is "%s".', name, funcName, correct);
            }
            else {
                Fire.error('Unknown parameter of %s.%s', name, funcName);
            }
        }
    }

    return cls;
};

// 预处理属性值，例如：notify等
function preParseProperties (name, properties) {
    for (var propName in properties) {
        var val = properties[propName];
        if (!val) {
            continue;
        }

        var notify = val.notify;
        if (notify) {
            if (val.get || val.set) {
                if (FIRE_DEV) {
                    Fire.warn('"notify" can\'t work with "get/set" !');
                }
                continue;
            }
            if (val.hasOwnProperty('default')) {
                // 添加新的内部属性，将原来的属性修改为 getter/setter 形式
                // 以 _ 开头将自动设置property 为 Fire.HideInInspector
                var newKey = "_val$" + propName;

                (function (notify, newKey) {
                    val.get = function () {
                        return this[newKey];
                    };
                    val.set = function (value) {
                        var oldValue = this[newKey];
                        this[newKey] = value;
                        notify.call(this, oldValue);
                    };
                })(notify, newKey);

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

        var wrapperOf = val.wrapper;
        if (wrapperOf) {
            if (val.type) {
                Fire.warn('The "wrapper" attribute of %s.%s can not be used with "type"', name, propName);
            }
            if (Fire.isChildClassOf(wrapperOf, Fire.Runtime.NodeWrapper)) {
                val.type = wrapperOf;
                continue;
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
    }
}

var tmpAttrs = [];
function parseAttributes (attrs, className, propName) {
    var ERR_Type = FIRE_EDITOR ? 'The %s of %s must be type %s' : '';

    tmpAttrs.length = 0;
    var result = tmpAttrs;

    var type = attrs.type;
    if (type) {
        if (Array.isArray(type)) {
            if (type.length > 0) {
                type = type[0];
            }
            else {
                Fire.error('Invalid type of %s.%s', className, propName);
                return;
            }
        }
        if (type === Fire.Integer) {
            result.push( { type: Fire.Integer } );
        }
        else if (type === Fire.Float || type === Number) {
            result.push( { type: Fire.Float } );
        }
        else if (type === Fire.Boolean || type === Boolean) {
            result.push({
                type: Fire.Boolean,
                _onAfterProp: getTypeChecker(Fire.Boolean, 'Fire.Boolean')
            });
        }
        else if (type === Fire.String || type === String) {
            result.push({
                type: Fire.String,
                _onAfterProp: getTypeChecker(Fire.String, 'Fire.String')
            });
        }
        else if (type === 'Object' || type === Object) {
            if (FIRE_EDITOR) {
                Fire.error('Please define "type" parameter of %s.%s as the actual constructor.', className, propName);
            }
        }
        else if (type === Fire._ScriptUuid) {
            var attr = Fire.ObjectType(Fire.ScriptAsset);
            attr.type = 'Script';
            result.push(attr);
        }
        else {
            if (typeof type === 'object') {
                if (Fire.isEnumType(type)) {
                    result.push({
                        type: 'Enum',
                        enumList: Fire.getEnumList(type)
                    });
                }
                else if (FIRE_EDITOR) {
                    Fire.error('Please define "type" parameter of %s.%s as the constructor of %s.', className, propName, type);
                }
            }
            else if (typeof type === 'function') {
                result.push(Fire.ObjectType(type));
            }
            else if (FIRE_EDITOR) {
                Fire.error('Unknown "type" parameter of %s.%s：%s', className, propName, type);
            }
        }
    }

    function parseSimpleAttr (attrName, expectType, attrCreater) {
        var val = attrs[attrName];
        if (val) {
            if (typeof val === expectType) {
                if (typeof attrCreater === 'undefined') {
                    var attr = {};
                    attr[attrName] = val;
                    result.push(attr);
                }
                else {
                    result.push(typeof attrCreater === 'function' ? attrCreater(val) : attrCreater);
                }
            }
            else if (FIRE_EDITOR) {
                Fire.error('The %s of %s.%s must be type %s', attrName, className, propName, expectType);
            }
        }
    }

    parseSimpleAttr('rawType', 'string', Fire.RawType);
    parseSimpleAttr('editorOnly', 'boolean', Fire.EditorOnly);
    parseSimpleAttr('displayName', 'string');
    parseSimpleAttr('multiline', 'boolean', { multiline: true });
    parseSimpleAttr('readonly', 'boolean', { readOnly: true });
    parseSimpleAttr('tooltip', 'string');

    if (attrs.serializable === false) {
        result.push(Fire.NonSerialized);
    }

    var visible = attrs.visible;
    if (typeof visible !== 'undefined') {
        if ( !attrs.visible ) {
            result.push({ visible: false });
        }
    }
    else {
        var startsWithUS = (propName.charCodeAt(0) === 95);
        if (startsWithUS) {
            result.push({ visible: false });
        }
    }

    //if (attrs.custom) {
    //    result.push( { custom: attrs.custom });
    //}

    var range = attrs.range;
    if (range) {
        if (Array.isArray(range)) {
            if (range.length >= 2) {
                result.push(Fire.Range(range[0], range[1]));
            }
            else if (FIRE_EDITOR) {
                Fire.error('The length of range array must be 2');
            }
        }
        else if (FIRE_EDITOR) {
            Fire.error(ERR_Type, '"range"', className + '.' + propName, 'array');
        }
    }

    var nullable = attrs.nullable;
    if (nullable) {
        if (typeof nullable === 'object') {
            var boolPropName = nullable.propName;
            if (typeof boolPropName === 'string') {
                var def = nullable.default;
                if (typeof def === 'boolean') {
                    result.push(Fire.Nullable(boolPropName, def));
                }
                else if (FIRE_EDITOR) {
                    Fire.error(ERR_Type, '"default"', 'nullable object', 'boolean');
                }
            }
            else if (FIRE_EDITOR) {
                Fire.error(ERR_Type, '"propName"', 'nullable object', 'string');
            }
        }
        else if (FIRE_EDITOR) {
            Fire.error(ERR_Type, '"nullable"', className + '.' + propName, 'object');
        }
    }

    var watch = attrs.watch;
    if (watch) {
        if (typeof watch === 'object') {
            for (var watchKey in watch) {
                var watchCallback = watch[watchKey];
                if (typeof watchCallback === 'function') {
                    result.push(Fire.Watch(watchKey.split(' '), watchCallback));
                }
                else if (FIRE_EDITOR) {
                    Fire.error(ERR_Type, 'value', 'watch object', 'function');
                }
            }
        }
        else if (FIRE_EDITOR) {
            Fire.error(ERR_Type, 'watch', className + '.' + propName, 'object');
        }
    }

    return result;
}
