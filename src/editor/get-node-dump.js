//var _isDomNode = require('../core/utils').isDomNode;
var JS = Fire.JS;

/**
 * @module Editor
 */

function getType (obj) {
    if (typeof obj === 'object') {
        obj = obj.constructor;
    }
    var p = obj.prototype;
    if (p.hasOwnProperty('__cid__')) {
        return p.__cid__;
    }
    return '';
}

var enumTypeId = 0;

function dumpAttrs (data, attrs) {
    if (attrs.ctor) {
        data.type = JS._getClassId(attrs.ctor);
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

    // dump FireClass
    if (klass) {
        // TODO - cache
        var properties = {};
        var propNames = klass.__props__;
        if (propNames) {
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
        }
        return {
            properties: properties
        };
    }
    else {
        return {};
    }
}

function dumpObject (types, obj) {
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
            attrType = getAttrType(types, obj);
            actualType = JS._getClassId(obj);
            if (attrType !== actualType) {
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
            attrType = getAttrType(types, obj);
            actualType = JS._getClassId(obj);
            if (attrType !== actualType) {
                return {
                    __type__: actualType,
                    id: obj.id
                };
            }
            else {
                return {
                    id: obj.id
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

function dumpField (types, val) {
    if (typeof val === 'object') {
        return dumpObject(types, val);
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
            data[propName] = dumpField(types, obj[propName]);
            //console.log('dumpField(types, obj[' + propName + ']) ' + data[propName]);
        }
    }
}

// assert(obj && typeof obj === 'object')
function dumpMain (types, wrapper) {
    var data = {};

    // dump main type
    var typeId = getType(wrapper);
    console.log('typeId: ' + typeId);
    if (typeId) {
        data.__type__ = typeId;
        types[typeId] = dumpType(wrapper);
    }

    // dump wrapper values
    dumpByClass(types, data, wrapper, wrapper.constructor);

    // iterate mixins
    var mixinClasses = wrapper.target._mixinClasses;
    if (mixinClasses) {
        data.__mixins__ = [];
        for (var i = 0; i < mixinClasses.length; i++) {
            var klass = mixinClasses[i];
            typeId = getType(klass);
            if (typeId) {
                types[typeId] = dumpType(klass);
                var mixinData = {
                    __type__: typeId
                };

                // dump mixin values
                dumpByClass(types, mixinData, wrapper.target, klass);

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
    enumTypeId = 0;
    var types = {};

    if (!node) {
        return {
            types: types,
            value: null
        };
    }

    var wrapper = Fire.node(node);
    var value = dumpMain(types, wrapper);

    return {
        types: types,
        value: value
    };
};

module.exports = Editor.getNodeDump;
