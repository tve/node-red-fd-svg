// import everything from json-html
import {
  HtmlElement,
  hasType,
  hasId,
  hasClass,
  hasAttrValue,
  setAttr,
  addClass,
  removeClass,
  addStyles,
  removeStyles,
  addChild,
} from "../src/json-html"

describe("HtmlElement", () => {
  describe("Find with explicit predicate", () => {
    const root = make_gauges()
    it("should find lines", () => {
      expect(root.find(el => el._ === "line").length).toEqual(4)
    })
    it("should return empty array when nothing is found", () => {
      expect(root.find(el => el._ === "foo").length).toEqual(0)
    })
  })

  describe("Find with helper functions", () => {
    const root = make_gauges()
    it("should find lines", () => {
      expect(root.find(hasType("line")).length).toEqual(4)
    })
    it("should find lines with id", () => {
      expect(root.find(hasId("line1"))[0].id).toEqual("line1")
    })
    it("should find lines with class", () => {
      expect(root.find(hasClass("line")).length).toEqual(4)
    })
  })

  describe("ForEach with helper functions", () => {
    const root = make_gauges()
    it("should set an attribute on lines", () => {
      expect(root.forEach(hasType("line"), setAttr("foo", "bar")).length).toEqual(4)
      expect(root.find(hasAttrValue("foo", "bar")).length).toEqual(4)
    })
  })

  describe("Exporting to JSON", () => {
    const root = make_gauges()
    it("should export to JSON", () => {
      const json = JSON.stringify(root)
      expect(json.length).toBeGreaterThan(20)
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
      gauge
    ),
    new HtmlElement(
      "g",
      {
        transform: "scale(0.5 0.5) translate(-100 -80)",
      },
      gauge
    ),
    new HtmlElement(
      "g",
      {
        transform: "scale(0.5 0.5) translate(100 0)",
      },
      gauge
    ),
    new HtmlElement(
      "g",
      {
        transform: "scale(0.5 0.5) translate(100 -80)",
      },
      gauge
    ),
  ]

  return new HtmlElement("svg", { width: 200, height: 200 }, elements)
}
