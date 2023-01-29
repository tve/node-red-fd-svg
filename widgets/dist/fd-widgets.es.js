const r = window.Vue.h, n = {
  name: "RawHTML",
  props: {
    html: {
      default: null,
      type: Array,
      tip: "Array of HTML elements with {tag, id, classes, attrs, children} structure"
    }
  },
  methods: {
    gen_element(t) {
      if (t.tag == "span")
        return r("span", {}, t.text || "");
      const e = { ...t.attrs };
      return Array.isArray(e.class) && e.class.length == 0 && delete e.class, r(
        t.tag,
        e,
        (t.children || []).map((s) => this.gen_element(s))
      );
    }
  },
  render() {
    if (!(!this.html || !Array.isArray(this.html)))
      return console.log("RawHTML render:", JSON.stringify(this.html, null, 2)), r(
        "div",
        { style: "display:contents" },
        this.html.map((t) => this.gen_element(t))
      );
  }
}, a = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: n
}, Symbol.toStringTag, { value: "Module" })), l = /* @__PURE__ */ Object.assign({ "./raw-html.vue": a });
export {
  l as default
};
