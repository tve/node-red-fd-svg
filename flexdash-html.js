// FlexDash raw HTML node for Node-RED -- Send raw HTML into a widget
// Copyright ©2023 by Thorsten von Eicken, see LICENSE

const { parse_html } = require("./reflect-html.js")

module.exports = function (RED) {
  function flexdashHtml(config) {
    RED.nodes.createNode(this, config)
    this.plugin = RED.plugins.get("flexdash")

    // Initialize the widget and get a handle onto the FlexDash widget API.
    const widget = RED.plugins.get("flexdash").initWidget(this, config, "HtmlWidget")
    if (!widget) return // missing config node, thus no FlexDash to hook up to, nothing to do here

    this.html_seq = 0

    // API call to get the current DOM
    RED.httpAdmin.get("/_fd_html/preview", (req, res) => {
      console.log("GET /_fd_html/preview", req.query)
      res.set("Content-Type", "application/json")
      const data = JSON.stringify({ seq: this.html_seq, html: widget.get("html") })
      console.log(data)
      res.send(data)
    })

    this.on("input", msg => {
      // if we have a string payload then parse that as HTML and notify flow editors
      if (typeof msg.payload == "string") {
        const html = parse_html(msg.payload)
        widget.set("html", html)
        this.html_seq = Date.now()
        console.log("html_seq", this.html_seq, "html", html)
        RED.comms.publish("fd-html-preview", { seq: this.html_seq })
      }
      // if we have a string command and optionally some args then perform that command on the DOM
      if (typeof msg.command == "string") {
        const html = widget.get("html") || new HTMLArray()
        if (typeof html[msg.command] == "function") {
          html[msg.command](...(msg.args || []))
        }
        widget.set("html", html)
        this.html_seq = Date.now()
        RED.comms.publish("fd-html-preview", { seq: this.html_seq })
      }
    })
  }

  RED.nodes.registerType("flexdash html", flexdashHtml)
  RED.plugins.get("node-red-vue").createVueTemplate("flexdash html", __filename)
}
