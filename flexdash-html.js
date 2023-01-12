// FlexDash raw HTML node for Node-RED -- Send raw HTML into a widget
// Copyright ©2023 by Thorsten von Eicken, see LICENSE

import { parse_html } from "./reflect-html.js"

module.exports = function (RED) {
  function flexdashHtml(config) {
    RED.nodes.createNode(this, config)
    this.plugin = RED.plugins.get("flexdash")

    // Initialize the widget and get a handle onto the FlexDash widget API.
    const widget = RED.plugins.get("flexdash").initWidget(this, config, "HtmlWidget")
    if (!widget) return // missing config node, thus no FlexDash to hook up to, nothing to do here

    this.on("input", msg => {
      // if we have a string payload then parse that as HTML into the DOM
      if (typeof msg.payload == "string") {
        const html = parse_html(msg.payload)
        widget.set("dom", html)
      }
      // if we have a string command and optionally some args then perform that command on the DOM
      if (typeof msg.command == "string") {
        const dom = widget.get("dom")
        if (typeof dom[msg.command] == "function") {
          dom[msg.command](...(msg.args || []))
        }
        widget.set("dom", dom)
      }
    })
  }

  RED.nodes.registerType("flexdash html", flexdashHtml)
}
