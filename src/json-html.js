"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addChild = exports.removeStyles = exports.addStyles = exports.removeClass = exports.addClass = exports.setAttr = exports.hasAttrValue = exports.hasClass = exports.hasId = exports.hasType = exports.HtmlElement = void 0;
function is_json_dict(x) {
    return x instanceof Object && !Array.isArray(x);
}
// For symmetry. Could simply use Array.isArray(x).
function is_json_array(x) {
    return Array.isArray(x);
}
// HtmlElement
class HtmlElement {
    constructor(type, attrs, children) {
        this._ = type || "";
        this._children = children || [];
        Object.assign(this, attrs);
    }
    // find all nodes in the subtree that match the predicate
    find(predicate) {
        let res = [];
        if (predicate(this))
            res = [this];
        if (this._children)
            return res.concat(this._children.flatMap(child => child.find(predicate)));
        return res;
    }
    // find all matching nodes and perform an operation on each one, return list of changed el
    forEach(predicate, op) {
        let modified = [];
        if (predicate(this)) {
            op(this);
            modified.push(this);
        }
        if (this._children)
            modified.push(...this._children.flatMap(child => child.forEach(predicate, op)));
        return modified;
    }
}
exports.HtmlElement = HtmlElement;
// Predicates on HtmlElement to be used with find
function hasType(type) {
    return el => el._ === type;
}
exports.hasType = hasType;
function hasId(id) {
    return el => el.id === id;
}
exports.hasId = hasId;
function hasClass(cls) {
    return el => !!el.class?.includes(cls);
}
exports.hasClass = hasClass;
function hasAttrValue(attr, value) {
    return (el) => {
        if (typeof el == "object")
            return JSON.stringify(el[attr]) == JSON.stringify(value);
        return el[attr] == value;
    };
}
exports.hasAttrValue = hasAttrValue;
// Operations on HtmlElements to be used with forEach
function setAttr(attr, value) {
    return el => {
        el[attr] = value;
    };
}
exports.setAttr = setAttr;
function addClass(cls) {
    return el => {
        if (el.class)
            el.class.push(cls);
        else
            el.class = [cls];
    };
}
exports.addClass = addClass;
function removeClass(cls) {
    return el => {
        if (el.class)
            el.class = el.class.filter(c => c !== cls);
    };
}
exports.removeClass = removeClass;
function addStyles(style) {
    return el => {
        if (el.style)
            Object.assign(el.style, style);
        else
            el.style = style;
    };
}
exports.addStyles = addStyles;
function removeStyles(styles) {
    return el => {
        if (el.style)
            for (const key of styles)
                delete el.style[key];
    };
}
exports.removeStyles = removeStyles;
function addChild(child) {
    return el => {
        el._children.push(child);
    };
}
exports.addChild = addChild;
