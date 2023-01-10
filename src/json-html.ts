// interface HtmlElementType {
//   _: string
//   _children: HtmlElementType[]
// }
// declare JSON types
type JsonValue = null | string | number | boolean | JsonArray | JsonDict
type JsonArray = JsonValue[]
interface JsonDict extends Record<string, JsonValue> {}

function is_json_dict(x: JsonValue): x is JsonDict {
  return x instanceof Object && !Array.isArray(x)
}

// For symmetry. Could simply use Array.isArray(x).
function is_json_array(x: JsonValue): x is JsonArray {
  return Array.isArray(x)
}

// HtmlElement

export class HtmlElement {
  _: string
  _children: HtmlElement[]
  id?: string
  class?: JsonArray
  style?: JsonDict;
  [key: string]: JsonValue | HtmlElement[] | undefined | ((...args: any[]) => any)

  constructor(type: string, attrs: Record<string, string | number>, children?: HtmlElement[]) {
    this._ = type || ""
    this._children = children || []
    Object.assign(this, attrs)
  }

  // find all nodes in the subtree that match the predicate
  find(predicate: (el: HtmlElement) => boolean): HtmlElement[] {
    let res: HtmlElement[] = []
    if (predicate(this)) res = [this]
    if (this._children) return res.concat(this._children.flatMap(child => child.find(predicate)))
    return res
  }

  // find all matching nodes and perform an operation on each one, return list of changed el
  forEach(predicate: (el: HtmlElement) => boolean, op: (el: HtmlElement) => void): HtmlElement[] {
    let modified = []
    if (predicate(this)) {
      op(this)
      modified.push(this)
    }
    if (this._children)
      modified.push(...this._children.flatMap(child => child.forEach(predicate, op)))
    return modified
  }
}

// Predicates on HtmlElement to be used with find
export function hasType(type: string): (el: HtmlElement) => boolean {
  return el => el._ === type
}
export function hasId(id: string): (el: HtmlElement) => boolean {
  return el => el.id === id
}
export function hasClass(cls: string): (el: HtmlElement) => boolean {
  return el => !!el.class?.includes(cls)
}
export function hasAttrValue(attr: string, value: JsonValue): (el: HtmlElement) => boolean {
  return (el: HtmlElement) => {
    if (typeof el == "object") return JSON.stringify(el[attr]) == JSON.stringify(value)
    return el[attr] == value
  }
}

// Operations on HtmlElements to be used with forEach
export function setAttr(attr: string, value: JsonValue): (el: HtmlElement) => void {
  return el => {
    ;(el[attr] as JsonValue) = value
  }
}
export function addClass(cls: string): (el: HtmlElement) => void {
  return el => {
    if (el.class) el.class.push(cls)
    else el.class = [cls]
  }
}
export function removeClass(cls: string): (el: HtmlElement) => void {
  return el => {
    if (el.class) el.class = el.class.filter(c => c !== cls)
  }
}
export function addStyles(style: JsonDict): (el: HtmlElement) => void {
  return el => {
    if (el.style) Object.assign(el.style, style)
    else el.style = style
  }
}
export function removeStyles(styles: string[]): (el: HtmlElement) => void {
  return el => {
    if (el.style) for (const key of styles) delete el.style[key]
  }
}
export function addChild(child: HtmlElement): (el: HtmlElement) => void {
  return el => {
    el._children.push(child)
  }
}
