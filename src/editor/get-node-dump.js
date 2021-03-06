//var _isDomNode = require('../core/utils').isDomNode;
var JS = Fire.JS;

/**
 * @module Editor
 */

function getTypeId (obj) {
    if (typeof obj === 'object') {
        obj = obj.constructor;
    }
    return JS.getClassName(obj);
}

function dumpAttrs (data, attrs) {
    if (attrs.ctor) {
        data.type = getTypeId(attrs.ctor);
    }
    else if (attrs.type) {
        data.type = attrs.type;
    }

    if (attrs.readonly) {
        data.readonly = attrs.readonly;
    }

    if (attrs.hasOwnProperty('default')) {
        data.default = attrs.default;
    }
    else if (attrs.hasSetter === false) {
        data.readonly = false;
    }

    if (attrs.hasOwnProperty('visible')) {
        data.visible = attrs.visible;
    }
    if (attrs.enumList) {
        data.enumList = attrs.enumList;
    }
    if (attrs.hasOwnProperty('displayName')) {
        data.displayName = attrs.displayName;
    }
    if (attrs.hasOwnProperty('multiline')) {
        data.multiline = attrs.multiline;
    }
    if (attrs.hasOwnProperty('min')) {
        data.min = attrs.min;
    }
    if (attrs.hasOwnProperty('max')) {
        data.max = attrs.max;
    }
    if (attrs.nullable) {
        // {String} - the property name of boolean value
        data.nullable = attrs.nullable;
    }
    if (attrs.tooltip) {
        data.tooltip = attrs.tooltip;
    }
}

function dumpInheritanceChain (klass) {
    var chain = [];
    var typeId;

    // fireclass
    var superCls = klass;
    for (;;) {
        if (superCls !== klass) {
            typeId = getTypeId(superCls);
            if (typeId) {
                chain.push(typeId);
            }
        }
        if (superCls.$super) {
            superCls = superCls.$super;
        }
        else {
            break;
        }
    }
    // js class
    var dunderProto = Object.getPrototypeOf(superCls.prototype);
    while (dunderProto) {
        superCls = dunderProto.constructor;
        if (superCls && superCls !== klass) {
            typeId = getTypeId(superCls);
            if (typeId) {
                chain.push(typeId);
            }
        }
        dunderProto = Object.getPrototypeOf(superCls.prototype);
    }
    return chain;
}

// assert(obj)
function dumpType (obj) {
    var klass;
    if (typeof obj === 'object') {
        var isEnum = Fire.isEnumType(obj);
        if (isEnum) {
            // dump Enum
            var enumList = Fire.getEnumList(obj);
            return enumList;
        }
        else {
            klass = obj.constructor;
        }
    }
    else {
        klass = obj;
    }

    var retval = {};

    // dump FireClass
    if (klass) {
        // TODO - cache
        var chain = dumpInheritanceChain(klass);
        if (chain.length > 0) {
            retval.extends = chain;
        }
        // dump props
        var propNames = klass.__props__;
        if (propNames) {
            var properties = {};
            for (var p = 0; p < propNames.length; p++) {
                var propName = propNames[p];
                var dumpProp = {};
                // dump inspector attrs
                var attrs = Fire.attr(klass, propName);
                if (attrs) {
                    dumpAttrs(dumpProp, attrs);
                }
                properties[propName] = dumpProp;
            }
            retval.properties = properties;
        }
    }

    return retval;
}

function getExpectedTypeInClassDef (types, klass, propName) {
    var typeId = getTypeId(klass);
    if (typeId) {
        var typeInfo = types[typeId];
        if (typeInfo) {
            return typeInfo.properties[propName].type;
        }
    }
}

function dumpObject (types, obj, expectedType) {
    if (!obj) {
        return null;
    }
    var attrType, actualType;
    if (obj instanceof FObject) {
        // FObject
        if ( !obj.isValid ) {
            return null;
        }
        var uuid = obj._uuid;
        if (uuid) {
            // Asset
            actualType = getTypeId(obj);
            if (expectedType !== actualType) {
                return {
                    __type__: actualType,
                    uuid: uuid
                };
            }
            else {
                return {
                    uuid: uuid
                };
            }
        }
        // TODO - 支持嵌套对象 and 循环引用?

        if (obj instanceof Fire.Runtime.NodeWrapper) {
            actualType = getTypeId(obj);
            if (expectedType !== actualType) {
                return {
                    __type__: actualType,
                    id: obj.uuid
                };
            }
            else {
                return {
                    id: obj.uuid
                };
            }
        }

        return null;
    }
    else if (obj instanceof Fire.ValueType) {
        return Editor.serialize(obj, {stringify: false});
    }

    // TODO - 支持数组和表
    return null;
}

function dumpField (types, val, expectedType) {
    if (typeof val === 'object') {
        return dumpObject(types, val, expectedType);
    }
    else if (typeof val !== 'function') {
        return val;
    }
    else {
        // function
        return null;
    }
}

function dumpByClass (types, data, obj, klass) {
    var props = klass.__props__;
    if (props) {
        for (var p = 0; p < props.length; p++) {
            var propName = props[p];
            var expectedType = getExpectedTypeInClassDef(types, klass, propName);
            data[propName] = dumpField(types, obj[propName], expectedType);
            //console.log('dumpField(types, obj[' + propName + ']) ' + data[propName]);
        }
    }
}

// assert(obj && typeof obj === 'object')
function dumpMain (types, wrapper) {
    var data = {};

    // dump main type
    var typeId = getTypeId(wrapper);
    if (typeId) {
        data.__type__ = typeId;
        types[typeId] = dumpType(wrapper);
    }

    // dump wrapper values
    dumpByClass(types, data, wrapper, wrapper.constructor);

    // iterate mixins
    var mixinClasses = wrapper.targetN._mixinClasses;
    if (mixinClasses) {
        data.__mixins__ = [];
        for (var i = 0; i < mixinClasses.length; i++) {
            var klass = mixinClasses[i];
            typeId = getTypeId(klass);
            if (typeId) {
                types[typeId] = dumpType(klass);
                var mixinData = {
                    __type__: typeId
                };

                // dump mixin values
                dumpByClass(types, mixinData, wrapper.targetN, klass);

                data.__mixins__.push(mixinData);
            }
        }
    }

    return data;
}

/**
 * Take a snapshot on node for inspector.
 * @method getNodeDump
 * @param {RuntimeNode}
 * @return {object} - returns a json object such like:
 * ```
 *  {
 *      types: {
 *          type1: {
 *              extends: ["type_base", "object"]
 *              properties: {
 *                  key1: {
 *                      default: 0,
 *                      type: 'Integer' // ["Integer"|"Float"|"String"|"Boolean"|"Object"|"Enum"|"Script"]
 *                  }
 *              }
 *          },
 *          mixin1: {
 *              properties: {
 *                  key2: {
 *                      default: 0,
 *                      type: 'Integer'
 *                  },
 *                  asset: {
 *                      __type__: 'Fire.Texture',
 *                      uuid: 'uuid'
 *                  },
 *                  node: {
 *                      __type__: 'Runtime.NodeWrapper',
 *                      id: 'id'
 *                  }
 *              }
 *          }
 *      },
 *      value: {
 *          __type__: 'type1',
 *          key1: value1,
 *
 *          __mixins__: [{
 *              __type__: 'mixin1',
 *              key2: value2,
 *          }],
 *      }
 *  }
 * ```
 */
Editor.getNodeDump = function (node) {
    var types = {};

    if (!node) {
        return {
            types: types,
            value: null
        };
    }

    var wrapper = Fire(node);
    var value = dumpMain(types, wrapper);

    return {
        types: types,
        value: value
    };
};

module.exports = Editor.getNodeDump;

// for unit tests
Editor.getNodeDump.dumpInheritanceChain = dumpInheritanceChain;
