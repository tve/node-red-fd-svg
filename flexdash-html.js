"use strict";
// FlexDash raw HTML node for Node-RED -- Send raw HTML into a widget
// Copyright ©2023 by Thorsten von Eicken, see LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const reflect_html_1 = require("./reflect-html");
function default_1(RED) {
    function flexdashHtml(config) {
        RED.nodes.createNode(this, config);
        const plugin = RED.plugins.get("flexdash");
        // Initialize the widget and get a handle onto the FlexDash widget API.
        const widget = RED.plugins.get("flexdash").initWidget(this, config, "RawHTML");
        if (!widget)
            return; // missing config node, thus no FlexDash to hook up to, nothing to do here
        let html_seq = 0;
        // API call to get the current DOM
        this.log(`Registering /_fd_html/preview/${this.id}`);
        RED.httpAdmin.get(`/_fd_html/preview/${this.id}`, (req, res) => {
            //console.log(`GET /_fd_html/preview/${this.id}`, req.query)
            res.set("Content-Type", "application/json");
            const data = JSON.stringify({ seq: html_seq, html: widget.get("html") });
            res.send(data);
        });
        this.on("input", (msg) => {
            let updated = false;
            let html;
            // if we have a string payload then parse that as HTML and notify flow editors
            if (typeof msg.payload == "string") {
                html = (0, reflect_html_1.parse_html)(msg.payload);
                updated = true;
            }
            else {
                const json = widget.get("html");
                html = new reflect_html_1.HtmlArray(...json.map(reflect_html_1.fromJSON));
            }
            let sel = html;
            //console.log("INPUT", msg, html)
            // process array of commands as well as single command
            const commands = Array.isArray(msg.commands) ? msg.commands : [];
            if (msg.command)
                commands.unshift({ selector: msg.selector, command: msg.command, args: msg.args });
            for (const cmd of commands) {
                if (typeof cmd.command == "string" && typeof html[cmd.command] == "function") {
                    // process any selector
                    if (typeof cmd.selector == "string") {
                        if (cmd.selector == "")
                            sel = html;
                        if (cmd.selector != ".")
                            sel = html.select(cmd.selector);
                    }
                    // fix-up arguments
                    let args = Array.isArray(cmd.args) ? cmd.args : [];
                    // for commands that expect HTML elements, convert the args to HtmlElement
                    if (["append", "prepend", "replaceWith"].includes(cmd.command)) {
                        args = args.map(reflect_html_1.fromJSON);
                    }
                    //console.log(`CMD ${cmd.command}(${JSON.stringify(args).substring(0,100)}) on ${sel.length}`)
                    // perform the command
                    ;
                    sel[cmd.command](...args);
                    updated = true;
                    //console.log("RESULT", JSON.stringify(html, null, 2))
                }
            }
            if (updated) {
                widget.set("html", html.map(h => h.toJSON()));
                html_seq = Date.now();
                RED.comms.publish("fd-html-preview", { seq: html_seq });
            }
        });
    }
    RED.nodes.registerType("flexdash html", flexdashHtml);
    RED.plugins.get("node-red-vue").createVueTemplate("flexdash html", __filename);
}
exports.default = default_1;
