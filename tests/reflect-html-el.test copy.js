"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import everything from json-html
const reflect_html_1 = require("../reflect-html");
const gauges_1 = require("./gauges");
describe("HtmlElement", () => {
    // ===== simple tests of matchers
    describe("Simple match", () => {
        it("should match tag", () => {
            const el = new reflect_html_1.HtmlElement("div");
            expect(el.matches("div")).toBeTruthy();
            expect(el.matches("xxx")).toBeFalsy();
        });
        it("should match tag and id", () => {
            const el = new reflect_html_1.HtmlElement("div", { id: "foo" });
            expect(el.matches("div#foo")).toBeTruthy();
            expect(el.matches("div#bar")).toBeFalsy();
        });
        it("should match tag and class", () => {
            const el = new reflect_html_1.HtmlElement("div", { class: "foo" });
            expect(el.matches("div.foo")).toBeTruthy();
            expect(el.matches("div.bar")).toBeFalsy();
        });
        it("should match tag and attribute", () => {
            const el = new reflect_html_1.HtmlElement("div", { foo: "bar" });
            expect(el.matches("div[foo=bar]")).toBeTruthy();
            expect(el.matches("div[foo=baz]")).toBeFalsy();
        });
        it("should match id", () => {
            const el = new reflect_html_1.HtmlElement("div", { id: "foo" });
            expect(el.matches("#foo")).toBeTruthy();
            expect(el.matches("#bar")).toBeFalsy();
        });
        it("should match class", () => {
            const el = new reflect_html_1.HtmlElement("div", { class: "foo" });
            expect(el.matches(".foo")).toBeTruthy();
            expect(el.matches(".bar")).toBeFalsy();
        });
        it("should match attribute", () => {
            const el = new reflect_html_1.HtmlElement("div", { foo: "bar" });
            expect(el.matches("[foo=bar]")).toBeTruthy();
            expect(el.matches("[foo=baz]")).toBeFalsy();
        });
        it("should match tag, id, class, and attribute", () => {
            const el = new reflect_html_1.HtmlElement("div", "foo", ["hey", "bar"], { boom: "baz" });
            expect(el.matches("div#foo.bar[boom=baz]")).toBeTruthy();
            expect(el.matches("div#foo.bar[try=baz]")).toBeFalsy();
        });
        it("should match multiple classes", () => {
            const el = new reflect_html_1.HtmlElement("div", { class: "hey foo ta bar zulu" });
            expect(el.matches(".foo.bar")).toBeTruthy();
            expect(el.matches(".bar.foo.bar")).toBeTruthy();
            expect(el.matches(".foo.bar.xxx")).toBeFalsy();
        });
        it("should match multiple attributes", () => {
            const el = new reflect_html_1.HtmlElement("div", { foo: "bar", boom: "baz" });
            expect(el.matches("[foo=bar][boom=baz]")).toBeTruthy();
            expect(el.matches("[boom=baz][foo=bar]")).toBeTruthy();
            expect(el.matches("[boom=xxx][foo=bar]")).toBeFalsy();
            expect(el.matches("[xxx=baz][foo=bar]")).toBeFalsy();
            expect(el.matches("div[boom=baz][foo=bar]")).toBeTruthy();
        });
    });
    // ===== recursive tests matching gauges
    describe("Find with explicit predicate", () => {
        const root = (0, gauges_1.make_gauges)();
        it("should find lines", () => {
            expect(root.select(el => el.tag === "line").length).toEqual(4);
        });
        it("should return empty array when nothing is found", () => {
            expect(root.select(el => el.tag === "foo").length).toEqual(0);
        });
    });
    describe("Find with selectors", () => {
        const root = (0, gauges_1.make_gauges)();
        it("should select lines", () => {
            expect(root.select("line").length).toEqual(4);
        });
        it("should select lines with id", () => {
            expect(root.select("#line1")[0].id).toEqual("line1");
        });
        it("should select lines with class", () => {
            expect(root.select(".line").length).toEqual(4);
        });
        it("should match nothing if provided a bogus selector", () => {
            expect(root.select(12).length).toEqual(0);
        });
    });
    describe("Find with hierarchical selectors", () => {
        const root = (0, gauges_1.make_gauges)();
        it("should select line in g2", () => {
            expect(root.select("g#g2 line").length).toEqual(1);
            expect(root.select("#g2 line").length).toEqual(1);
            expect(root.select("g line").length).toEqual(4);
            expect(root.select("h line").length).toEqual(0);
        });
    });
    describe("Exporting to JSON", () => {
        const root = (0, gauges_1.make_gauges)();
        it("should export to JSON", () => {
            const json = JSON.stringify(root);
            expect(json.length).toBeGreaterThan(20);
        });
    });
});
