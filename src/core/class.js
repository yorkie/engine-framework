﻿var JS = require('./js');
var Utils = require('./utils');
var _isPlainEmptyObj_DEV = Utils.isPlainEmptyObj_DEV;
var _cloneable_DEV = Utils.cloneable_DEV;

require('./attribute');

///**
// * both getter and prop must register the name into __props__ array
// * @param {string} name - prop name
// */
var _appendProp = function (name/*, isGetter*/) {
    if (FIRE_DEV) {
        //var JsVarReg = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
        //if (!JsVarReg.test(name)) {
        //    Fire.error('The property name "' + name + '" is not compliant with JavaScript naming standards');
        //    return;
        //}
        if (name.indexOf('.') !== -1) {
            Fire.error('Disallow to use "." in property name');
            return;
        }
    }

    if (!this.__props__) {
        this.__props__ = [name];
    }
    else {
        var index = this.__props__.indexOf(name);
        if (index < 0) {
            this.__props__.push(name);
        }
        // 这里不进行报错，因为重写 prop 可以是一个合法的行为，可以用于设置新的默认值。
        //else {
        //    Fire.error(Fire.getClassName(this) + '.' + name + ' is already defined!');
        //}
    }
};

///**
// * the metaclass of the "fire class" created by Fire.define, all its static members
// * will inherited by fire class.
// */
var _metaClass = {

    // string[]
    __props__: null,

    /**
     * Add new instance field, propertie, or method made available on the class.
     * 该方法定义的变量默认情况下都会被序列化，也会在inspector中显示。
     * 如果传入属性包含Fire.HideInInspector则仍会序列化但不在inspector中显示。
     * 如果传入属性包含Fire.NonSerialized则不会序列化并且不会在inspector中显示。
     * 如果传入属性包含Fire.EditorOnly则只在编辑器下序列化，打包时不序列化。
     *
     * @method class.prop
     * @param {string} name - the property name
     * @param {*} defaultValue - the default value
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @return {function} the class itself
     * @private
     */
    prop: function (name, defaultValue, attribute) {
        'use strict';
        if (FIRE_DEV) {
            // check default object value
            if (typeof defaultValue === 'object' && defaultValue) {
                if (Array.isArray(defaultValue)) {
                    // check array empty
                    if (defaultValue.length > 0) {
                        Fire.error('Default array must be empty, set default value of %s.prop("%s", ...) to null or [], ' +
                                   'and initialize in constructor please. (just like "this.%s = [...];")',
                                    JS.getClassName(this), name, name);
                        return this;
                    }
                }
                else if (!_isPlainEmptyObj_DEV(defaultValue)) {
                    // check cloneable
                    if (!_cloneable_DEV(defaultValue)) {
                        Fire.error('Do not set default value to non-empty object, ' +
        'unless the object defines its own "clone" function. Set default value of %s.prop("%s", ...) to null or {}, ' +
        'and initialize in constructor please. (just like "this.%s = {foo: bar};")',
                            JS.getClassName(this), name, name);
                        return this;
                    }
                }
            }

            // check base prototype to avoid name collision
            for (var base = this.$super; base; base = base.$super) {
                // 这个循环只能检测到最上面的FireClass的父类，如果再上还有父类，将不做检测。（Fire.extend 将 prototype.constructor 设为子类）
                if (base.prototype.hasOwnProperty(name)) {
                    Fire.error('Can not declare %s.%s, it is already defined in the prototype of %s',
                        JS.getClassName(this), name, JS.getClassName(base));
                    return;
                }
            }
        }

        // set default value
        Fire.attr(this, name, { 'default': defaultValue });

        // register property
        _appendProp.call(this, name);

        // 禁用，因为getter/setter需要动态获得类型，所以类型统一由上层处理
        //// apply default type (NOTE: if user provide type attribute, this one will be overwrote)
        //var mytype = typeof defaultValue;
        //if ( mytype === 'number' ) {
        //    mytype = 'float';
        //}
        //Fire.attr( this, name, { 'type': mytype } );

        // apply attributes
        if (attribute) {
            var onAfterProp = null;
            var AttrArgStart = 2;
            for (var i = AttrArgStart; i < arguments.length; i++) {
                var attr = arguments[i];
                Fire.attr(this, name, attr);
                // register callback
                if (attr._onAfterProp) {
                    onAfterProp = onAfterProp || [];
                    onAfterProp.push(attr._onAfterProp);
                }
            }
            // call callback
            if (onAfterProp) {
                for (var c = 0; c < onAfterProp.length; c++) {
                    onAfterProp[c](this, name);
                }
            }
        }
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，默认会在inspector中显示。
     * 如果传入参数包含Fire.HideInInspector则不在inspector中显示。
     *
     * @method class.get
     * @param {string} name - the getter property
     * @param {function} getter - the getter function which returns the real property
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @return {function} the class itself
     * @private
     */
    get: function (name, getter, attribute) {
        'use strict';

        if (FIRE_DEV) {
            var d = Object.getOwnPropertyDescriptor(this.prototype, name);
            if (d && d.get) {
                Fire.error('%s: the getter of "%s" is already defined!', JS.getClassName(this), name);
                return this;
            }
        }

        if (attribute) {
            var AttrArgStart = 2;
            for (var i = AttrArgStart; i < arguments.length; i++) {
                var attr = arguments[i];
                if (FIRE_DEV) {
                    if (attr._canUsedInGetter === false) {
                        Fire.error('Can not apply the specified attribute to the getter of "%s.%s", attribute index: %s',
                            JS.getClassName(this), name, (i - AttrArgStart));
                        continue;
                    }
                }

                Fire.attr(this, name, attr);

                if (FIRE_DEV) {
                    // check attributes
                    if (attr.serializable === false || attr.editorOnly === true) {
                        Fire.warn('No need to use Fire.NonSerialized or Fire.EditorOnly for the getter of %s.%s, ' +
                                  'every getter is actually non-serialized.',
                            JS.getClassName(this), name);
                    }
                    if (attr.hasOwnProperty('default')) {
                        Fire.error('%s: Can not set default value of a getter!', JS.getClassName(this));
                        return this;
                    }
                }
            }
        }
        Fire.attr(this, name, Fire.NonSerialized);

        if (FIRE_DEV) {
            // 不论是否 hide in inspector 都要添加到 props，否则 asset watcher 不能正常工作
            _appendProp.call(this, name/*, true*/);
        }

        if (Object.getOwnPropertyDescriptor(this.prototype, name)) {
            Object.defineProperty(this.prototype, name, {
                get: getter
            });
        }
        else {
            Object.defineProperty(this.prototype, name, {
                get: getter,
                configurable: true,
                enumerable: true
            });
        }

        if (FIRE_EDITOR) {
            Fire.attr(this, name, {hasGetter: true}); // 方便 editor 做判断
        }
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，除非有对应的getter否则不在inspector中显示。
     *
     * @method class.set
     * @static
     * @param {string} name - the setter property
     * @param {function} setter - the setter function
     * @return {function} the class itself
     * @private
     */
    set: function (name, setter) {
        if (FIRE_DEV) {
            var d = Object.getOwnPropertyDescriptor(this.prototype, name);
            if (d && d.set) {
                Fire.error('%s: the setter of "%s" is already defined!', JS.getClassName(this), name);
                return this;
            }
        }

        if (FIRE_EDITOR) {
            Object.defineProperty(this.prototype, name, {
                set: function setter_editorWrapper (value) {
                    if (this._observing) {
                        Object.getNotifier(this).notify({
                            type: 'update',
                            name: name,
                            oldValue: this[name]
                        });
                    }
                    setter.call(this, value);
                },
                configurable: true,
                enumerable: true
            });
            Fire.attr(this, name, { hasSetter: true }); // 方便 editor 做判断
        }
        else {
            if (Object.getOwnPropertyDescriptor(this.prototype, name)) {
                Object.defineProperty(this.prototype, name, {
                    set: setter
                });
            }
            else {
                Object.defineProperty(this.prototype, name, {
                    set: setter,
                    configurable: true,
                    enumerable: true
                });
            }
        }

        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，默认会在inspector中显示。
     * 如果传入参数包含Fire.HideInInspector则不在inspector中显示。
     *
     * @method class.getset
     * @static
     * @param {string} name - the getter property
     * @param {function} getter - the getter function which returns the real property
     * @param {function} setter - the setter function
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @return {function} the class itself
     * @private
     */
    getset: function (name, getter, setter, attribute) {
        'use strict';
        if (attribute) {
            var getterArgs = [].slice.call(arguments);
            getterArgs.splice(2, 1);    // remove setter
            this.get.apply(this, getterArgs);
        }
        else {
            this.get(name, getter);
        }
        this.set(name, setter);
        return this;
    }
};

function instantiateProps (instance, itsClass) {
    var propList = itsClass.__props__;
    if (propList) {
        for (var i = 0; i < propList.length; i++) {
            var prop = propList[i];
            var attrs = Fire.attr(itsClass, prop);
            if (attrs && attrs.hasOwnProperty('default')) {  // getter does not have default, default maybe 0
                var def = attrs.default;
                if (typeof def === 'object' && def) {
                    // 防止多个实例引用相同对象
                    if (def.clone) {
                        def = def.clone();
                    }
                    else if (Array.isArray(def)) {
                        def = [];
                    }
                    else {
                        def = {};
                    }
                }
                instance[prop] = def;
            }
        }
    }
}

/**
 * Checks whether the constructor is created by Fire.define or Fire.Class
 *
 * @method _isFireClass
 * @param {function} constructor
 * @return {Boolean}
 * @private
 */
Fire._isFireClass = function (constructor) {
    return !!constructor && (constructor.prop === _metaClass.prop);
};

/**
 * @method _convertToFireClass
 * @param {function} constructor
 * @private
 */
Fire._convertToFireClass = function (constructor) {
    constructor.prop = _metaClass.prop;
};

/**
 * Checks whether subclass is child of superclass or equals to superclass
 *
 * @method isChildClassOf
 * @param {function} subclass
 * @param {function} superclass
 * @return {Boolean}
 */
Fire.isChildClassOf = function (subclass, superclass) {
    if (subclass && superclass) {
        if (typeof subclass !== 'function') {
            if (FIRE_DEV) {
                Fire.warn('[isChildClassOf] subclass should be function type, not', subclass);
            }
            return false;
        }
        if (typeof superclass !== 'function') {
            if (FIRE_DEV) {
                Fire.warn('[isChildClassOf] superclass should be function type, not', superclass);
            }
            return false;
        }
        // fireclass
        for (; subclass && subclass.$super; subclass = subclass.$super) {
            if (subclass === superclass) {
                return true;
            }
        }
        if (subclass === superclass) {
            return true;
        }
        // js class
        var dunderProto = Object.getPrototypeOf(subclass.prototype);
        while (dunderProto) {
            subclass = dunderProto.constructor;
            if (subclass === superclass) {
                return true;
            }
            dunderProto = Object.getPrototypeOf(subclass.prototype);
        }
    }
    return false;
};

function _initClass(className, fireClass) {
    // occupy some non-inherited static members
    for (var staticMember in _metaClass) {
        Object.defineProperty(fireClass, staticMember, {
            value: _metaClass[staticMember],
            // __props__ is writable
            writable: staticMember === '__props__',
            // __props__ is enumerable so it can be inherited by Fire.extend
            enumerable: staticMember === '__props__'
        });
    }
}

function _nicifyFireClass (fireClass, className) {
    if (FIRE_EDITOR) {
        if (className) {
            fireClass.toString = function () {
                var plain = Function.toString.call(this);
                return plain.replace('function ', 'function ' + JS.getClassName(this));
            };
        }
    }
}

Fire._doDefine = function (className, baseClass, constructor) {
    var useTryCatch = ! JS.String.startsWith(className, 'Fire.');
    var fireClass = _createCtor(constructor, baseClass, useTryCatch);
    _initClass(className, fireClass);

    if (baseClass) {
        // inherit
        JS.extend(fireClass, baseClass);
        fireClass.$super = baseClass;
        if (baseClass.__props__) {
            // copy __props__
            fireClass.__props__ = baseClass.__props__.slice();
        }
    }

    JS.setClassName(className, fireClass);

    if (FIRE_EDITOR) {
        _nicifyFireClass(fireClass, className);
    }

    return fireClass;
};

/**
 * Defines a FireClass using the given constructor.
 *
 * @method define
 * @param {string} [className] - the name of class that is used to deserialize this class
 * @param {function} [constructor] - a constructor function that is used to instantiate this class
 * @return {function} the constructor of newly defined class
 * @private
 */
Fire.define = function (className, constructor) {
    return Fire.extend(className, null, constructor);
};

/**
 * Creates a sub FireClass based on the specified baseClass parameter.
 *
 * @method extend
 * @param {string} [className] - the name of class that is used to deserialize this class
 * @param {function} baseClass - !#en The base class to inherit from
 *                               !#zh 继承的基类
 * @param {function} [constructor] - a constructor function that is used to instantiate this class,
 *                                   if not supplied, the constructor of baseClass will be called automatically.
 * @return {function} the constructor of newly defined class
 * @private
 */
Fire.extend = function (className, baseClass, constructor) {
    if (typeof className === 'function') {
        if (FIRE_DEV) {
            if (constructor) {
                Fire.error('[Fire.extend] invalid type of arguments');
                return null;
            }
        }
        constructor = baseClass;
        baseClass = className;
        className = '';
    }
    if (typeof className === 'string') {
        return Fire._doDefine(className, baseClass, constructor);
    }
    else if (typeof className === 'undefined') {
        // 未传入任何参数
        return Fire._doDefine('', baseClass, constructor);
    }
    else if (FIRE_DEV && className) {
        Fire.error('[Fire.extend] unknown typeof first argument:' + className);
    }
    return null;
};

function _checkCtor (ctor) {
    if (FIRE_DEV) {
        if (Fire._isFireClass(ctor)) {
            Fire.error("Constructor can not be another FireClass");
            return;
        }
        if (typeof ctor !== 'function') {
            Fire.error("Constructor of FireClass must be function type");
            return;
        }
        if (ctor.length > 0) {
            // fireball-x/dev#138: To make a unified FireClass serialization process,
            // we don't allow parameters for constructor when creating instances of FireClass.
            // For advance user, construct arguments can still get from 'arguments'.
            Fire.warn("Can not instantiate FireClass with arguments.");
            return;
        }
    }
}

function _createCtor (constructor, baseClass, useTryCatch) {
    if (constructor && FIRE_DEV) {
        _checkCtor(constructor);
    }
    // get base user constructors
    var ctors;
    if (Fire._isFireClass(baseClass)) {
        ctors = baseClass.__ctors__;
        if (ctors) {
            ctors = ctors.slice();
        }
    }
    else if (baseClass) {
        ctors = [baseClass];
    }
    // append subclass user constructors
    if (ctors) {
        if (constructor) {
            ctors.push(constructor);
        }
    }
    else if (constructor) {
        ctors = [constructor];
    }
    // create class constructor
    var fireClass;
    var body = '(function(){\n';

    if (FIRE_EDITOR) {
        body += 'this._observing=false;\n';
    }
    body += 'instantiateProps(this,fireClass);\n';

    // call user constructors
    if (ctors) {
        if (FIRE_EDITOR) {
            console.assert(ctors.length > 0);
        }

        body += 'var cs=fireClass.__ctors__;\n';

        if (useTryCatch) {
            body += 'try{\n';
        }

        if (ctors.length <= 5) {
            for (var i = 0; i < ctors.length; i++) {
                body += '(cs[' + i + ']).apply(this,arguments);\n';
            }
        }
        else {
            body += 'for(var i=0,l=cs.length;i<l;++i){\n';
            body += '(cs[i]).apply(this,arguments);\n}\n';
        }

        if (useTryCatch) {
            body += '}catch(e){\nFire._throw(e);\n}\n';
        }
    }
    body += '})';

    // jshint evil: true
    fireClass = eval(body);
    // jshint evil: false

    Object.defineProperty(fireClass, '__ctors__', {
        value: ctors || null,
        writable: false,
        enumerable: false
    });
    return fireClass;
}

/**
 * Specially optimized define function only for internal base classes
 *
 * @method _fastDefine
 * @param {string} className
 * @param {function} constructor
 * @param {string[]} serializableFields
 * @private
 */
Fire._fastDefine = function (className, constructor, serializableFields) {
    JS.setClassName(className, constructor);
    constructor.__props__ = serializableFields;
    for (var i = 0; i < serializableFields.length; i++) {
        Fire.attr(constructor, serializableFields[i], { visible: false });
    }
};

module.exports = {
    instantiateProps: instantiateProps
};
