"use strict";
// HtmlElement represents an HTML document as a data structure on which JQuery-like operations can
// be applied and from which all changes can be reflected via messages to a remote client.
// Copyright (c) 2023 by Thorsten von Eicken, MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlElement = exports.HtmlArray = exports.parse_html = void 0;
const node_html_parser_1 = require("node-html-parser");
// parse an HTML string into an HtmlElement tree, return the root element
function parse_html(html) {
    const root = (0, node_html_parser_1.parse)(html, {
        lowerCaseTagName: true,
        comment: false,
        fixNestedATags: true,
        parseNoneClosedTags: true,
    });
    console.log(root.childNodes);
    const res = root.childNodes.map(convert).filter(el => el !== null);
    return new HtmlArray(...res);
}
exports.parse_html = parse_html;
// HtmlArray is an array of HtmlElement with methods added to select a subset of elements using
// JQuery-style finders and perform mutations using JQuery style methods.
class HtmlArray extends Array {
    constructor(...args) {
        super(...args);
    }
    // select all nodes in the subtrees of all elements in the array
    // x may be a DOM selector (tag#id.class.class[attr=val][attr=val]) or
    // x may be a predicate function (el: HtmlElement => boolean)
    select(x) {
        return new HtmlArray(...this.flatMap(el => el.select(x)));
    }
    id(id) {
        if (id === undefined)
            return this.map(el => el.id);
        this.map(el => (el.id = id));
        return this;
    }
    // add one or multiple classes to the elements, returns the array for chaining
    addClass(...classes) {
        this.forEach(el => el.addClass(...classes));
        return this;
    }
    // check whether any of the elements has a class, returns a boolean
    hasClass(cls) {
        return this.some(el => el.hasClass(cls));
    }
    // remove one or multiple classes from the elements, returns the array for chaining
    removeClass(...classes) {
        this.forEach(el => el.removeClass(...classes));
        return this;
    }
    // get an attribute for all elements in the array (different from JQuery, it gets an attr of
    // the first element only)
    // or set an attribute on all elements in the array
    attr(name, value) {
        if (value === undefined)
            return this.map(el => el.attr(name));
        this.forEach(el => el.attr(name, value));
        return this;
    }
    // check whether any of the elements has an attribute, returns a boolean (doesn't exist in JQuery)
    hasAttr(name) {
        return this.some(el => el.hasAttr(name));
    }
}
exports.HtmlArray = HtmlArray;
class HtmlElement {
    constructor(tag, ...args) {
        this.classes = [];
        this.attrs = {};
        this.tag = tag;
        if (args.length <= 2) {
            // attrs includes id and classes, need to tease apart
            if (args[0] != null && typeof args[0] !== "object")
                throw new Error("invalid args");
            const attrs = (args[0] || {});
            this.id = attrs.id || "";
            this.classes = attrs.class ? attrs.class.split(" ") : [];
            this.attrs = Object.fromEntries(Object.entries(attrs)
                .filter(([k, v]) => k != "id" && k != "class")
                .map(([k, v]) => [k, String(v)]));
            var children = args[1];
        }
        else {
            this.id = args[0] || "";
            this.classes = Array.isArray(args[1]) ? args[1].concat() : args[1]?.split(" ") || [];
            this.attrs = Object.assign({}, args[2]) || {};
            var children = args[3];
        }
        if (children != null && !Array.isArray(children))
            throw new Error("invalid args");
        this.children = children || [];
    }
    get id() {
        return this._id || "";
    }
    set id(id) {
        this._id = id || undefined;
    }
    clone() {
        return new HtmlElement(this.tag, this.id, this.classes, this.attrs, this.children.map(c => c.clone()));
    }
    select(x) {
        if (typeof x === "string")
            return new HtmlArray(...this._find_by_selector(x));
        if (typeof x === "function")
            return new HtmlArray(...this.find_by_predicate(x));
        return new HtmlArray();
    }
    // find all nodes in the subtree that match the predicate
    find_by_predicate(predicate) {
        let res = [];
        if (predicate(this))
            res = [this];
        if (this.children)
            return res.concat(this.children.flatMap(child => child.find_by_predicate(predicate)));
        return res;
    }
    // return the list of subtree elements that match a selector
    _find_by_selector(selector) {
        const parts = selector.split(" ");
        if (parts.length == 1)
            return this.find_by_predicate(matcher(parts[0]));
        const [first, ...rest] = parts;
        const firsts = this.find_by_predicate(matcher(first));
        return firsts.flatMap(el => el._find_by_selector(rest.join(" ")));
    }
    // check whether this element matches a selector
    matches(selector) {
        return matcher(selector)(this);
    }
    // operations on classes
    addClass(...classes) {
        for (const c of classes)
            if (!this.classes.includes(c))
                this.classes.push(c);
        return this;
    }
    hasClass(cls) {
        return this.classes.includes(cls);
    }
    removeClass(...classes) {
        const before = this.classes;
        this.classes = this.classes.filter(c => !classes.includes(c));
        return this;
    }
    // operations on attributes
    attr(name, value) {
        if (value === undefined)
            return this.attrs[name];
        this.attrs[name] = value;
        return this;
    }
    hasAttr(name) {
        return name in this.attrs;
    }
}
exports.HtmlElement = HtmlElement;
// produce a matcher to match HtmlElement tags, #ids, .classes, and [attributes=val]
// i.e. return a function that takes an HtmlElement and returns true if it matches the selector
function matcher(selector) {
    function match(str, regexp) {
        const mm = str.match(regexp);
        return mm ? mm[0] : "";
    }
    const tag = selector.match(/^[^#:.[ ]+/);
    const id = match(selector, /#[^#.[ ]+/).substring(1);
    const classes = (selector.match(/\.[^.#[ ]+/g) || []).map(c => c.substring(1));
    // [foo] -> "foo" in attrs, [foo=] -> attrs["foo"]=="" [foo=bar] -> attrs["foo"]=="bar"
    const attrs = selector.match(/\[[^\]=]+(=[^\]]*)?\]/g)?.map(a => a.slice(1, -1).split("="));
    return (el) => {
        if (tag && tag[0] != el.tag)
            return false;
        if (id && id != el.id)
            return false;
        if (classes.length > 0 && !classes.every(c => el.classes?.includes(c)))
            return false;
        if (attrs && !attrs.every(([k, v]) => (v === undefined ? k in el.attrs : el.attrs[k] == v)))
            return false;
        return true;
    };
}
function convert(el) {
    if (el instanceof node_html_parser_1.HTMLElement) {
        return new HtmlElement(el.rawTagName, el.id, el.classList.value, el.attributes, el.childNodes.map(convert).filter(el => el !== null));
    }
    if (el instanceof node_html_parser_1.TextNode)
        return new HtmlElement("text", { __text: el.textContent });
    return null;
}
