// HtmlElement represents an HTML document as a data structure on which JQuery-like operations can
// be applied and from which all changes can be reflected via messages to a remote client.
// Copyright (c) 2023 by Thorsten von Eicken, MIT License

import { parse, HTMLElement, TextNode, Node } from "node-html-parser"

// parse an HTML string into an HtmlElement tree, return the root element
export function parse_html(html: string): HtmlArray {
  const root = parse(html, {
    lowerCaseTagName: true,
    comment: false,
    fixNestedATags: true,
    parseNoneClosedTags: true,
  })
  //console.log(root.childNodes)
  const res = root.childNodes.map(convert).filter(el => el !== null) as HtmlElement[]
  return new HtmlArray(...res)
}

// HtmlArray is an array of HtmlElement with methods added to select a subset of elements using
// JQuery-style finders and perform mutations using JQuery style methods.
export class HtmlArray extends Array {
  constructor(...args: HtmlElement[]) {
    super(...(args as any))
  }

  // select all nodes in the subtrees of all elements in the array
  // x may be a DOM selector (tag#id.class.class[attr=val][attr=val]) or
  // x may be a predicate function (el: HtmlElement => boolean)
  select(x: any): HtmlArray {
    return new HtmlArray(...(this.flatMap(el => el.select(x)) as HtmlElement[]))
  }

  // get/set the element IDs
  id(): string[] // get returns an array of IDs
  id(id: string): this // set returns the array for chaining
  id(id?: any): any {
    if (id === undefined) return this.map(el => el.id)
    this.map(el => (el.id = id))
    return this
  }

  // add one or multiple classes to the elements, returns the array for chaining
  addClass(...classes: string[]): this {
    this.forEach(el => el.addClass(...classes))
    return this
  }
  // check whether any of the elements has a class, returns a boolean
  hasClass(cls: string): boolean {
    return this.some(el => el.hasClass(cls))
  }
  // remove one or multiple classes from the elements, returns the array for chaining
  removeClass(...classes: string[]): this {
    this.forEach(el => el.removeClass(...classes))
    return this
  }

  // get an attribute for all elements in the array (different from JQuery, it gets an attr of
  // the first element only)
  // or set an attribute on all elements in the array
  attr(name: string, value?: string): (string | undefined)[] | this {
    if (value === undefined) return this.map(el => el.attr(name))
    this.forEach(el => el.attr(name, value))
    return this
  }
  // check whether any of the elements has an attribute, returns a boolean (doesn't exist in JQuery)
  hasAttr(name: string): boolean {
    return this.some(el => el.hasAttr(name))
  }
}

export class HtmlElement {
  tag: string
  children: HtmlElement[]
  _id?: string
  classes: string[] = []
  attrs: Record<string, string> = {}

  constructor(
    tag: string,
    id: string | null,
    classes: string[] | null,
    attrs: Record<string, string>,
    children?: HtmlElement[]
  )
  constructor(tag: string, attrs?: Record<string, any>, children?: HtmlElement[])
  constructor(tag: string, ...args: any[]) {
    this.tag = tag
    if (args.length <= 2) {
      // attrs includes id and classes, need to tease apart
      if (args[0] != null && typeof args[0] !== "object") throw new Error("invalid args")
      const attrs = (args[0] || {}) as Record<string, any>
      this.id = attrs.id || ""
      this.classes = attrs.class ? attrs.class.split(" ") : []
      this.attrs = Object.fromEntries(
        Object.entries(attrs)
          .filter(([k, v]) => k != "id" && k != "class")
          .map(([k, v]) => [k, String(v)])
      )
      var children = args[1]
    } else {
      this.id = args[0] || ""
      this.classes = Array.isArray(args[1]) ? args[1].concat() : args[1]?.split(" ") || []
      this.attrs = Object.assign({}, args[2]) || {}
      var children = args[3]
    }
    if (children != null && !Array.isArray(children)) throw new Error("invalid args")
    this.children = children || []
  }

  get id(): string {
    return this._id || ""
  }
  set id(id: string) {
    this._id = id || undefined
  }

  clone(): HtmlElement {
    return new HtmlElement(
      this.tag,
      this.id,
      this.classes,
      this.attrs,
      this.children.map(c => c.clone())
    )
  }

  // return an array of all HtmlElements that match a selector (x:string) or that match the
  // a predicate (x: HtmlElement=>boolean)
  select(x: string): HtmlArray
  select(predicate: (el: HtmlElement) => boolean): HtmlArray
  select(x: any): HtmlArray {
    if (typeof x === "string") return new HtmlArray(...this._find_by_selector(x))
    if (typeof x === "function") return new HtmlArray(...this.find_by_predicate(x))
    return new HtmlArray()
  }

  // find all nodes in the subtree that match the predicate
  find_by_predicate(predicate: (el: HtmlElement) => boolean): HtmlElement[] {
    let res: HtmlElement[] = []
    if (predicate(this)) res = [this]
    if (this.children)
      return res.concat(this.children.flatMap(child => child.find_by_predicate(predicate)))
    return res
  }

  // return the list of subtree elements that match a selector
  _find_by_selector(selector: string): HtmlElement[] {
    const parts = selector.split(" ")
    if (parts.length == 1) return this.find_by_predicate(matcher(parts[0]))
    const [first, ...rest] = parts
    const firsts = this.find_by_predicate(matcher(first))
    return firsts.flatMap(el => el._find_by_selector(rest.join(" ")))
  }

  // check whether this element matches a selector
  matches(selector: string): boolean {
    return matcher(selector)(this)
  }

  // operations on classes
  addClass(...classes: string[]): this {
    for (const c of classes) if (!this.classes.includes(c)) this.classes.push(c)
    return this
  }
  hasClass(cls: string): boolean {
    return this.classes.includes(cls)
  }
  removeClass(...classes: string[]): this {
    const before = this.classes
    this.classes = this.classes.filter(c => !classes.includes(c))
    return this
  }

  // operations on attributes
  attr(name: string, value?: string): string | undefined | this {
    if (value === undefined) return this.attrs[name]
    this.attrs[name] = value
    return this
  }
  hasAttr(name: string): boolean {
    return name in this.attrs
  }
}

// produce a matcher to match HtmlElement tags, #ids, .classes, and [attributes=val]
// i.e. return a function that takes an HtmlElement and returns true if it matches the selector
function matcher(selector: string): (el: HtmlElement) => boolean {
  function match(str: string, regexp: RegExp) {
    const mm = str.match(regexp)
    return mm ? mm[0] : ""
  }
  const tag = selector.match(/^[^#:.[ ]+/)
  const id = match(selector, /#[^#.[ ]+/).substring(1)
  const classes = (selector.match(/\.[^.#[ ]+/g) || []).map(c => c.substring(1))
  // [foo] -> "foo" in attrs, [foo=] -> attrs["foo"]=="" [foo=bar] -> attrs["foo"]=="bar"
  const attrs = selector.match(/\[[^\]=]+(=[^\]]*)?\]/g)?.map(a => a.slice(1, -1).split("="))
  return (el: HtmlElement) => {
    if (tag && tag[0] != el.tag) return false
    if (id && id != el.id) return false
    if (classes.length > 0 && !classes.every(c => el.classes?.includes(c))) return false
    if (attrs && !attrs.every(([k, v]) => (v === undefined ? k in el.attrs : el.attrs[k] == v)))
      return false
    return true
  }
}

function convert(el: Node): HtmlElement | null {
  if (el instanceof HTMLElement) {
    return new HtmlElement(
      el.rawTagName,
      el.id,
      el.classList.value,
      el.attributes,
      el.childNodes.map(convert).filter(el => el !== null) as HtmlElement[]
    )
  }
  if (el instanceof TextNode) return new HtmlElement("text", { __text: el.textContent })
  return null
}
