<!-- HTMLWidget - Widget to display raw HTML in FlexDash
     Copyright ©2023 Thorsten von Eicken, MIT license, see LICENSE file
-->
<script>
import { h } from "vue"

export default {
  name: "RawHTML",

  props: {
    html: {
      default: null,
      type: Array,
      tip: "Array of HTML elements with {tag, id, classes, attrs, children} structure",
    },
  },

  methods: {
    gen_element(elem) {
      if (elem.tag == "span") return h("span", {}, elem.text || "") // span and bare text are identical
      const attrs = { ...elem.attrs }
      if (Array.isArray(attrs.class) && attrs.class.length == 0) delete attrs.class
      // console.log(`GEN ${elem._}: ${attrsText} #${(elem._children||[]).length}`)
      return h(
        elem.tag,
        attrs,
        (elem.children || []).map(child => this.gen_element(child))
      )
    },
  },

  render() {
    if (!this.html || !Array.isArray(this.html)) return
    console.log("RawHTML render:", JSON.stringify(this.html, null, 2))
    return h(
      "div",
      { style: "display:contents" },
      this.html.map(h => this.gen_element(h))
    )
  },
}
</script>
