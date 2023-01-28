<!-- FlexDash HTML node for Node-RED
     Copyright ©2023 by Thorsten von Eicken, see LICENSE
-->
<script>
import { defineComponent, resolveComponent, h } from "vue"

export default defineComponent({
  name: "EditFlexdashHtml",
  props: {
    name: { type: String, required: false },
    title: { default: "", type: String, required: false },
    html: { default: "", type: Array, required: false }, // html tree to render in widget
    // required fields for FlexDash Widget nodes
    fd_container: { default: "", config_type: "flexdash container", required: true }, // grid/panel
    fd_cols: { default: 1, type: Number }, // widget width
    fd_rows: { default: 1, type: Number }, // widget height
    fd_array: { default: false, type: Boolean }, // create array of this widget
    fd_array_max: { default: 10, type: Number }, // max array size
  },
  inject: ["node"], // needed to get id
  data: () => ({
    tab: 0,
    html_preview: null, // HTML tree to render for preview
    html_seq: null, // HTML update seq number we have
    html_avail: null, // HTML update seq number available in run-time
    fetching: false, // a fetch of the preview is in progress
  }),

  mounted() {
    // subscribe to notifications from the runtime that there is a new preview to fetch
    RED.comms.subscribe("fd-html-preview", (topic, object) => {
      if (object && typeof object == "object") {
        if (object.seq && object.seq > this.html_seq) {
          if (!this.fetching) this.fetch_preview()
          this.html_avail = object.seq
        }
      }
    })
  },
  unmounted() {
    RED.comms.unsubscribe("fd-html-preview")
  },
  watch: {
    tab(v) {
      if (v == 1 && this.html_avail == null && !this.fetching) this.fetch_preview()
    },
  },

  methods: {
    fetch_preview() {
      this.fetching = true
      fetch(`_fd_html/preview/${this.node.id}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP status ${res.status}: ${res.statusText}`)
          return res.json()
        })
        .then(data => {
          console.log("got preview", data)
          this.fetching = false
          if (
            !data ||
            typeof data != "object" ||
            (!Array.isArray(data.html) && data.html != null) ||
            typeof data.seq != "number"
          )
            throw new Error("invalid HTML data")
          if (data.seq == 0) return // ignore empty DOM (no HTML injected
          if (data.seq <= this.html_seq) return // ignore old DOM
          this.html_preview = data.html
          this.html_seq = data.seq
          if (data.seq < this.html_avail) this.fetch_preview()
        })
        .catch(err => {
          this.fetching = false
          console.log("Error fetching preview:", err)
        })
    },

    // recursively generate a Vue VNode from a DOM element
    gen_element(elem) {
      if (elem.tag == "text") return h("span", {}, elem.attrs._text || "") // span and bare text are identical
      const attrs = { ...elem.attrs }
      if (elem.class) attrs.class = elem.classes
      if (elem.id) attrs.id = elem.id
      // console.log(`GEN ${elem._}: ${attrsText} #${(elem._children||[]).length}`)
      return h(
        elem.tag,
        attrs,
        (elem.children || []).map(child => this.gen_element(child))
      )
    },

    propagate(prop, value) {
      console.log("propagate", prop, value)
      this.$emit("update:prop", prop, value)
    },
  },

  // render function instead of template so we can turn the DOM we get into Vue
  // VNodes efficiently.
  render() {
    const NrTabs = resolveComponent("nr-tabs")
    const FdGeneralTab = resolveComponent("fd-general-tab")
    const dynHtml = this.html_preview
      ? this.html_preview.map(this.gen_element)
      : "Please inject some HTML..."
    return h(
      "div",
      { class: "h:full" },
      h("div", { class: "flex flex:col h:full" }, [
        h(NrTabs, {
          tabs: ["General", "Preview"],
          "model-value": this.tab,
          "onUpdate:modelValue": $event => (this.tab = $event),
        }),
        this.tab == 0
          ? h(FdGeneralTab, { "onUpdate:prop": this.propagate })
          : h("div", { class: "w:full p:4px r:4 b:1|solid|gray-70 overflow:hidden" }, dynHtml),
      ])
    )
  },

  node_red: {
    category: "flexdash",
    color: "#F0E4B8",
    inputs: 1,
    outputs: 0,
    icon: "font-awesome/fa-gear", // icon in flow editor
    paletteLabel: "FD html",
    label() {
      return this.name || "FD html"
    },
    labelStyle() {
      return this.name ? "node_label_italic" : ""
    },
  },
})
</script>
