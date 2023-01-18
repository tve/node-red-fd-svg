"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import everything from json-html
const reflect_html_1 = require("../reflect-html");
const gauges_1 = require("./gauges");
describe("HtmlArray", () => {
    // ===== HtmlArray mutations
    describe("HtmlArray mutations", () => {
        it("should add classes", () => {
            const root = (0, gauges_1.make_gauges)();
            expect(root.select(".myclass").length).toEqual(0);
            root.select("line").addClass("myclass");
            expect(root.select(".myclass").length).toEqual(4);
            expect(root.select(".myclass").hasClass("myclass")).toBeTruthy();
            expect(root.select(".myclass").hasClass("xxx")).toBeFalsy();
            expect(root.select("line.myclass").length).toEqual(4);
        });
        it("should remove classes", () => {
            const root = (0, gauges_1.make_gauges)();
            expect(root.select(".myclass").length).toEqual(0);
            root.select("line").addClass("myclass");
            expect(root.select(".myclass").length).toEqual(4);
            expect(root.select("#g2 line").length).toEqual(1);
            root.select("#g2 line").removeClass("myclass");
            expect(root.select(".myclass").length).toEqual(3);
            root.select("line").removeClass("myclass");
            expect(root.select(".myclass").length).toEqual(0);
        });
        it("should add attributes", () => {
            const root = (0, gauges_1.make_gauges)();
            expect(root.select("[foo=bar]").length).toEqual(0);
            root.select("line").attr("foo", "bar");
            expect(root.select("[foo=bar]").length).toEqual(4);
            expect(root.select("[foo=bar]").attr("foo")).toContain("bar");
            expect(root.select("[foo=bar]").attr("xxx")[0]).toEqual(undefined);
            expect(root.select("line[foo=bar]").length).toEqual(4);
        });
        // inner content mutations
        it("should add inner text", () => { });
    });
    // ===== Parse HTML
    describe("Parsing HTML", () => {
        it("should parse simple HTML elements", () => {
            const html = `<div id="foo"><span class="bar" test="1">hello</span></div>`;
            const els = (0, reflect_html_1.parse_html)(html);
            console.log(JSON.stringify(els));
            expect(els).toBeInstanceOf(reflect_html_1.HtmlArray);
            expect(els.length).toEqual(1);
            expect(els[0]?.tag).toEqual("div");
            expect(els.select("#foo").length).toEqual(1);
            expect(els.select(".bar").length).toEqual(1);
            expect(els.select("[test]").length).toEqual(1);
            expect(els.select("[test=1]").length).toEqual(1);
            expect(els.select("[__text]").length).toEqual(1);
            expect(els.select("[__text]").attr("__text")).toEqual(["hello"]);
        });
    });
});
