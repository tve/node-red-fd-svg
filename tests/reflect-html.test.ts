// import everything from json-html
import { HtmlElement, HtmlArray, parse_html } from "../reflect-html"

describe("HtmlElement", () => {
  // ===== simple tests of matchers

  describe("Simple match", () => {
    it("should match tag", () => {
      const el = new HtmlElement("div")
      expect(el.matches("div")).toBeTruthy()
      expect(el.matches("xxx")).toBeFalsy()
    })
    it("should match tag and id", () => {
      const el = new HtmlElement("div", { id: "foo" })
      expect(el.matches("div#foo")).toBeTruthy()
      expect(el.matches("div#bar")).toBeFalsy()
    })
    it("should match tag and class", () => {
      const el = new HtmlElement("div", { class: "foo" })
      expect(el.matches("div.foo")).toBeTruthy()
      expect(el.matches("div.bar")).toBeFalsy()
    })
    it("should match tag and attribute", () => {
      const el = new HtmlElement("div", { foo: "bar" })
      expect(el.matches("div[foo=bar]")).toBeTruthy()
      expect(el.matches("div[foo=baz]")).toBeFalsy()
    })
    it("should match id", () => {
      const el = new HtmlElement("div", { id: "foo" })
      expect(el.matches("#foo")).toBeTruthy()
      expect(el.matches("#bar")).toBeFalsy()
    })
    it("should match class", () => {
      const el = new HtmlElement("div", { class: "foo" })
      expect(el.matches(".foo")).toBeTruthy()
      expect(el.matches(".bar")).toBeFalsy()
    })
    it("should match attribute", () => {
      const el = new HtmlElement("div", { foo: "bar" })
      expect(el.matches("[foo=bar]")).toBeTruthy()
      expect(el.matches("[foo=baz]")).toBeFalsy()
    })
    it("should match tag, id, class, and attribute", () => {
      const el = new HtmlElement("div", "foo", ["hey", "bar"], { boom: "baz" })
      expect(el.matches("div#foo.bar[boom=baz]")).toBeTruthy()
      expect(el.matches("div#foo.bar[try=baz]")).toBeFalsy()
    })
    it("should match multiple classes", () => {
      const el = new HtmlElement("div", { class: "hey foo ta bar zulu" })
      expect(el.matches(".foo.bar")).toBeTruthy()
      expect(el.matches(".bar.foo.bar")).toBeTruthy()
      expect(el.matches(".foo.bar.xxx")).toBeFalsy()
    })
    it("should match multiple attributes", () => {
      const el = new HtmlElement("div", { foo: "bar", boom: "baz" })
      expect(el.matches("[foo=bar][boom=baz]")).toBeTruthy()
      expect(el.matches("[boom=baz][foo=bar]")).toBeTruthy()
      expect(el.matches("[boom=xxx][foo=bar]")).toBeFalsy()
      expect(el.matches("[xxx=baz][foo=bar]")).toBeFalsy()
      expect(el.matches("div[boom=baz][foo=bar]")).toBeTruthy()
    })
  })

  // ===== recursive tests matching gauges

  describe("Find with explicit predicate", () => {
    const root = make_gauges()
    it("should find lines", () => {
      expect(root.select(el => el.tag === "line").length).toEqual(4)
    })
    it("should return empty array when nothing is found", () => {
      expect(root.select(el => el.tag === "foo").length).toEqual(0)
    })
  })

  describe("Find with selectors", () => {
    const root = make_gauges()
    it("should select lines", () => {
      expect(root.select("line").length).toEqual(4)
    })
    it("should select lines with id", () => {
      expect(root.select("#line1")[0].id).toEqual("line1")
    })
    it("should select lines with class", () => {
      expect(root.select(".line").length).toEqual(4)
    })
    it("should match nothing if provided a bogus selector", () => {
      expect(root.select(12 as unknown as string).length).toEqual(0)
    })
  })

  describe("Find with hierarchical selectors", () => {
    const root = make_gauges()
    it("should select line in g2", () => {
      expect(root.select("g#g2 line").length).toEqual(1)
      expect(root.select("#g2 line").length).toEqual(1)
      expect(root.select("g line").length).toEqual(4)
      expect(root.select("h line").length).toEqual(0)
    })
  })

  describe("Exporting to JSON", () => {
    const root = make_gauges()
    it("should export to JSON", () => {
      const json = JSON.stringify(root)
      expect(json.length).toBeGreaterThan(20)
    })
  })

  // ===== HtmlArray mutations

  describe("HtmlArray mutations", () => {
    it("should add classes", () => {
      const root = make_gauges()
      expect(root.select(".myclass").length).toEqual(0)
      root.select("line").addClass("myclass")
      expect(root.select(".myclass").length).toEqual(4)
      expect(root.select(".myclass").hasClass("myclass")).toBeTruthy()
      expect(root.select(".myclass").hasClass("xxx")).toBeFalsy()
      expect(root.select("line.myclass").length).toEqual(4)
    })
    it("should remove classes", () => {
      const root = make_gauges()
      expect(root.select(".myclass").length).toEqual(0)
      root.select("line").addClass("myclass")
      expect(root.select(".myclass").length).toEqual(4)
      expect(root.select("#g2 line").length).toEqual(1)
      root.select("#g2 line").removeClass("myclass")
      expect(root.select(".myclass").length).toEqual(3)
      root.select("line").removeClass("myclass")
      expect(root.select(".myclass").length).toEqual(0)
    })
    it("should add attributes", () => {
      const root = make_gauges()
      expect(root.select("[foo=bar]").length).toEqual(0)
      root.select("line").attr("foo", "bar")
      expect(root.select("[foo=bar]").length).toEqual(4)
      expect(root.select("[foo=bar]").attr("foo")).toContain("bar")
      expect(root.select("[foo=bar]").attr("xxx")[0]).toEqual(undefined)
      expect(root.select("line[foo=bar]").length).toEqual(4)
    })
  })

  // ===== Parse HTML

  describe("Parsing HTML", () => {
    it("should parse simple HTML elements", () => {
      const html = `<div id="foo"><span class="bar" test="1">hello</span></div>`
      const els = parse_html(html)
      console.log(JSON.stringify(els))
      expect(els).toBeInstanceOf(HtmlArray)
      expect(els.length).toEqual(1)
      expect(els[0]?.tag).toEqual("div")
      expect(els.select("#foo").length).toEqual(1)
      expect(els.select(".bar").length).toEqual(1)
      expect(els.select("[test]").length).toEqual(1)
      expect(els.select("[test=1]").length).toEqual(1)
      expect(els.select("[__text]").length).toEqual(1)
      expect(els.select("[__text]").attr("__text")).toEqual(["hello"])
    })
  })
})

// ===== gauge test case

function make_gauges() {
  const value = Math.random() * 100
  const stroke_width = 100 - 70
  const stroke_radius = 100 - stroke_width / 2
  const arc = 90
  const circum = stroke_radius * 2 * Math.PI
  const xform = `rotate(${270 - arc / 2}, 0, 0)`

  const gauge = [
    new HtmlElement("circle", {
      cx: 0,
      cy: 0,
      fill: "transparent",
      r: stroke_radius,
      stroke: "lightgrey",
      "stroke-width": stroke_width,
      transform: xform,
      "stroke-dasharray": `${(arc * circum) / 360} ${circum}`,
    }),
    new HtmlElement("circle", {
      cx: 0,
      cy: 0,
      fill: "transparent",
      r: stroke_radius,
      stroke: "blue",
      "stroke-width": stroke_width,
      transform: xform,
      "stroke-dasharray": `${(((arc * value) / 100) * circum) / 360} ${circum}`,
    }),
    new HtmlElement("line", {
      id: "line1",
      class: "line",
      x1: 100 - 1.25 * stroke_width,
      y1: 0,
      x2: 100,
      y2: 0,
      stroke: "orange",
      "stroke-width": 2,
      transform: `rotate(${270 - arc / 2 + (arc * value) / 100}, 0, 0)`,
    }),
  ]

  const elements = [
    new HtmlElement(
      "g",
      {
        transform: "scale(0.5 0.5) translate(-100 0)",
      },
      gauge.map(el => el.clone())
    ),
    new HtmlElement(
      "g",
      {
        id: "g2",
        transform: "scale(0.5 0.5) translate(-100 -80)",
      },
      gauge.map(el => el.clone())
    ),
    new HtmlElement(
      "g",
      {
        transform: "scale(0.5 0.5) translate(100 0)",
      },
      gauge.map(el => el.clone())
    ),
    new HtmlElement(
      "g",
      {
        transform: "scale(0.5 0.5) translate(100 -80)",
      },
      gauge.map(el => el.clone())
    ),
  ]

  return new HtmlElement("svg", { width: 200, height: 200 }, elements)
}
