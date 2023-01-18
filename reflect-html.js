"use strict";
// HtmlElement represents an HTML document as a data structure on which JQuery-like operations can
// be applied and from which all changes can be reflected via messages to a remote client.
// Copyright (c) 2023 by Thorsten von Eicken, MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlElement = exports.HtmlArray = exports.fromJSON = exports.parse_html = void 0;
const node_html_parser_1 = require("node-html-parser");
// parse an HTML string into an HtmlElement tree, return the root element
function parse_html(html) {
    if (!html)
        return new HtmlArray();
    const root = (0, node_html_parser_1.parse)(html, {
        // the trmi is controversial, but `\n...\n` is a pain without
        lowerCaseTagName: true,
        comment: false,
        fixNestedATags: true,
        parseNoneClosedTags: true,
    }).removeWhitespace();
    //console.log(root.childNodes)
    const res = root.childNodes.map(convert).filter(el => el !== null);
    return new HtmlArray(...res);
}
exports.parse_html = parse_html;
// convert an (already parsed) json structure to an HtmlElement tree
function fromJSON(json) {
    if (json == null)
        return null;
    if (typeof json == "string")
        return new HtmlElement("span", json);
    if (typeof json != "object")
        throw new Error("json must be string or object");
    let children = [];
    if ("children" in json) {
        if (!Array.isArray(json.children))
            throw new Error("children must be an array");
        children = json.children.map(fromJSON).filter(el => el != null);
    }
    const j = json; // let HtmlElement constructor do the checking...
    if (j.tag == "span")
        return new HtmlElement("span", j.text);
    return new HtmlElement(j.tag, j.attrs, children);
}
exports.fromJSON = fromJSON;
// HtmlArray is an array of HtmlElement with methods added to select a subset of elements using
// JQuery-style finders and perform mutations using JQuery style methods.
// HtmlArray is called from plain javascript, thus the type annotations of methods are no
// guarantee of the actual types of the arguments.
class HtmlArray extends Array {
    constructor(...args) {
        if (args.length == 1 && typeof args[0] == "number") {
            super(args[0]);
            return;
        }
        if (!args.every((a) => a instanceof HtmlElement))
            throw new Error("HtmlElements required");
        args = args.filter((a) => a !== null);
        super(...args);
    }
    // select all nodes in the subtrees of all elements in the array
    // x may be a DOM selector (tag#id.class.class[attr=val][attr=val]) or
    // x may be a predicate function (el: HtmlElement => boolean)
    select(x) {
        if (typeof x !== "string")
            throw new Error("selector must be a string");
        return new HtmlArray(...this.flatMap(el => el.select(x)));
    }
    id(id) {
        if (id === undefined)
            return this.map(el => el.id);
        if (typeof id !== "string")
            throw new Error("id must be a string");
        this.map(el => (el.id = id));
        return this;
    }
    // add one or multiple classes to the elements, returns the array for chaining
    addClass(...classes) {
        if (!classes.every((c) => typeof c == "string"))
            throw new Error("classes must be strings");
        this.forEach(el => el.addClass(...classes));
        return this;
    }
    // check whether any of the elements has a class, returns a boolean
    hasClass(cls) {
        return this.some(el => el.hasClass(cls));
    }
    // remove one or multiple classes from the elements, returns the array for chaining
    removeClass(...classes) {
        if (!classes.every((c) => typeof c == "string"))
            throw new Error("classes must be strings");
        this.forEach(el => el.removeClass(...classes));
        return this;
    }
    // get an attribute for all elements in the array (different from JQuery, it gets an attr of
    // the first element only) or set an attribute on all elements in the array
    attr(name, value) {
        if (typeof name !== "string")
            throw new Error("attr name must be a string");
        if (value === undefined)
            return this.map(el => el.attr(name));
        if (typeof value !== "string")
            throw new Error("attr value must be a string");
        this.forEach(el => el.attr(name, value));
        return this;
    }
    // check whether any of the elements has an attribute, returns a boolean (doesn't exist in JQuery)
    hasAttr(name) {
        return this.some(el => el.hasAttr(name));
    }
    // operations on the inner content of all elements in the array
    // get or set the innerText or innerHTML of all elements in the array
    text(text) {
        if (text === undefined)
            return this.map(el => el.text()).join("");
        if (typeof text !== "string")
            throw new Error("text must be a string");
        this.forEach(el => el.text(text));
        return this;
    }
    html(html) {
        //if (html === undefined) return this.map(el => el.html())
        if (html == null || typeof html !== "string")
            throw new Error("html must be a string");
        const els = html ? parse_html(html) : [];
        this.empty();
        this.append(...els);
        return this;
    }
    // operations on the child nodes of all elements in the array
    // append one or multiple elements to the children of all elements in the array
    // the elements are appended to the first element in the array, the rest are cloned
    append(...children) {
        if (!children.every(c => c instanceof HtmlElement))
            throw new Error("HtmlElements required");
        this.forEach((el, ix) => {
            if (ix == 0)
                el.append(...children);
            else
                el.append(...children.map(c => c.clone()));
        });
        return this;
    }
    // prepend one or multiple elements to the children of all elements in the array
    // the elements are prepended to the first element in the array, the rest are cloned
    prepend(...children) {
        if (!children.every(c => c instanceof HtmlElement))
            throw new Error("HtmlElements required");
        this.forEach((el, ix) => {
            if (ix == 0)
                el.prepend(...children);
            else
                el.prepend(...children.map(c => c.clone()));
        });
        return this;
    }
    // remove all children from all elements in the array
    empty() {
        this.forEach(el => el.empty());
        return this;
    }
    // operations on all elements of the array
    // replace all elements in the array with one or multiple elements
    replaceWith(...elements) {
        if (!elements.every(c => c instanceof HtmlElement))
            throw new Error("HtmlElements required");
        this.forEach((el, ix) => {
            if (ix == 0)
                el.replaceWith(...elements);
            else
                el.replaceWith(...elements.map(el => el.clone()));
        });
        return this;
    }
    // remove all elements in the array from their parents
    remove() {
        this.forEach(el => el.remove());
        return this;
    }
}
exports.HtmlArray = HtmlArray;
function assertAttrValue(v, what) {
    if (typeof v == "string")
        return;
    if (!Array.isArray(v))
        throw new Error(`${what} must be string or array of strings`);
    if (!v.every((s) => typeof s == "string"))
        throw new Error(`${what} must be array of strings`);
}
class HtmlElement {
    constructor(tag, ...args) {
        this.attrs = {};
        this.parent = null;
        if (!tag || typeof tag != "string")
            throw new Error("tag must be non-empty string");
        this.tag = tag;
        if (tag == "span" && args.length == 1 && typeof args[0] == "string") {
            this._text = args[0];
            this.children = [];
        }
        else if (args.length <= 2) {
            // new HtmlElement(tag, attrs?, children?)
            this.attrs = {};
            this.children = [];
            if (args.length > 0 && !Array.isArray(args[0])) {
                if (args[0] != null && typeof args[0] !== "object")
                    throw new Error("attrs must be object");
                this.attrs = { ...(args.shift() || {}) };
                for (const k in this.attrs) {
                    if (typeof k != "string")
                        throw new Error("attrs keys must be strings");
                    assertAttrValue(this.attrs[k], "attrs");
                }
                this.normalize();
            }
            if (args.length == 1) {
                if (!Array.isArray(args[0]))
                    throw new Error("children must be array");
                if (!args[0].every(c => c instanceof HtmlElement))
                    throw new Error("children must be array of HtmlElements");
                this.children = args[0];
            }
        }
        else {
            // new HtmlElement(tag, id, classes, attrs, children?)
            if (args[2] == null || typeof args[2] !== "object")
                throw new Error("attrs must be object");
            this.attrs = { ...args[2] };
            for (const k in this.attrs) {
                if (typeof k != "string")
                    throw new Error("attrs keys must be strings");
                assertAttrValue(this.attrs[k], "attrs");
            }
            // handle id and classes
            if (args[0])
                this.attrs["id"] = args[0];
            if (args[1])
                this.attrs["class"] = args[1];
            this.normalize();
            // handle children
            if (args.length == 4 && args[3] != null) {
                if (!Array.isArray(args[3]))
                    throw new Error("children must be array");
                if (!args[3].every(c => c instanceof HtmlElement))
                    throw new Error("children must be array of HtmlElements");
                this.children = args[3];
            }
            else {
                this.children = [];
            }
        }
        this.setParent();
    }
    toJSON() {
        const ret = {
            tag: this.tag,
            attrs: this.attrs,
            children: this.children.map(c => {
                if (c instanceof HtmlElement)
                    return c.toJSON();
                else
                    console.log("$$$$$", c);
            }),
        };
        if ("_text" in this)
            ret.text = this._text;
        return ret;
    }
    // clone an HtmlElement tree
    clone() {
        // deep clone of attrs
        const attrs = { ...this.attrs };
        for (const k in attrs) {
            const v = attrs[k];
            if (Array.isArray(v))
                attrs[k] = [...v];
        }
        const children = this.children.map(c => c.clone());
        return new HtmlElement(this.tag, attrs, children);
    }
    // normalize id and class attributes
    normalize() {
        if ("id" in this.attrs) {
            var id = this.attrs.id;
            if (id == null || id == "")
                delete this.attrs.id;
            else if (typeof id != "string")
                throw new Error("id must be string");
        }
        if ("class" in this.attrs) {
            const c = this.attrs.class; // we don't know what it really is
            if (c == null)
                delete this.attrs.class;
            else if (typeof c === "string")
                this.attrs.class = c.split(" ");
            else if (!Array.isArray(c))
                throw new Error("class attr must be string or array of strings");
            else if (!c.every((s) => typeof s == "string"))
                throw new Error("class attr must be string or array of strings");
            if ("class" in this.attrs)
                this.attrs.class = c.filter(s => s != "");
        }
    }
    // set the parent property on all children
    setParent() {
        this.children.forEach(c => {
            c.parent = this;
        });
    }
    get id() {
        return this.attrs.id || "";
    }
    set id(id) {
        this.attrs.id = id;
        this.normalize();
    }
    select(x) {
        if (typeof x === "string")
            return new HtmlArray(...this.find_by_selector(x));
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
    find_by_selector(selector) {
        const parts = selector.split(" ");
        if (parts.length == 1)
            return this.find_by_predicate(matcher(parts[0]));
        const [first, ...rest] = parts;
        const firsts = this.find_by_predicate(matcher(first));
        return firsts.flatMap(el => el.find_by_selector(rest.join(" ")));
    }
    // check whether this element matches a selector
    matches(selector) {
        return matcher(selector)(this);
    }
    // operations on classes
    addClass(...classes) {
        if (!("class" in this.attrs))
            this.attrs.class = [];
        for (const c of classes)
            if (!this.attrs.class.includes(c))
                this.attrs.class.push(c);
        return this;
    }
    hasClass(cls) {
        return "class" in this.attrs && this.attrs.class.includes(cls);
    }
    removeClass(...classes) {
        if (!("class" in this.attrs))
            return this;
        this.attrs.class = this.attrs.class.filter(c => !classes.includes(c));
        return this;
    }
    attr(name, value) {
        if (value === undefined)
            return this.attrs[name];
        this.attrs[name] = value;
        return this;
    }
    hasAttr(name) {
        return name in this.attrs;
    }
    // inner content
    text(text) {
        if (text === undefined) {
            if (this.tag == "span")
                return this._text || "";
            return this.children.map(el => el.text()).join("");
        }
        if (this.tag == "span")
            this._text = text;
        else {
            for (const c of this.children)
                c.parent = null;
            this.children = [new HtmlElement("span", text)];
            this.setParent();
        }
        return this;
    }
    html(html) {
        for (const c of this.children)
            c.parent = null;
        this.children = parse_html(html);
        this.setParent();
        return this;
    }
    // append a child or children
    append(...children) {
        this.assertElArray(children);
        this.children.push(...children);
        this.setParent();
        return this;
    }
    // prepend a child or children
    prepend(...children) {
        this.assertElArray(children);
        this.children.unshift(...children);
        this.setParent();
        return this;
    }
    // remove all children
    empty() {
        for (const c of this.children)
            c.parent = null;
        this.children = [];
        return this;
    }
    // replace this element with another
    replaceWith(...elements) {
        this.assertElArray(elements);
        if (this.parent) {
            const idx = this.parent.children.indexOf(this);
            this.parent.children.splice(idx, 1, ...elements);
            this.parent.setParent();
            this.parent = null;
        }
        return this;
    }
    // remove this element from its parent
    remove() {
        if (this.parent) {
            const idx = this.parent.children.indexOf(this);
            this.parent.children.splice(idx, 1);
            this.parent = null;
        }
        return this;
    }
    assertEl(el) {
        if (!(el instanceof HtmlElement))
            throw new Error(`not an HtmlElement, got ${el}`);
    }
    assertElArray(els) {
        for (const el of els) {
            if (!(el instanceof HtmlElement))
                throw new Error(`not an HtmlElement, got ${el}`);
        }
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
        if (id && id != el.attrs.id)
            return false;
        if (classes.length > 0 && !classes.every(c => el.attrs.class?.includes(c)))
            return false;
        if (attrs && !attrs.every(([k, v]) => (v === undefined ? k in el.attrs : el.attrs[k] == v)))
            return false;
        return true;
    };
}
// convert a Node (HTMLElement or TextNode) to an HtmlElement (i.e. import from node-html-parser)
function convert(el) {
    if (el instanceof node_html_parser_1.HTMLElement) {
        const ret = new HtmlElement(el.rawTagName, el.id, el.classList.value, el.attributes, el.childNodes.map(convert).filter(el => el !== null));
        ret.setParent();
        return ret;
    }
    if (el instanceof node_html_parser_1.TextNode)
        return new HtmlElement("span", el.textContent);
    return null;
}
