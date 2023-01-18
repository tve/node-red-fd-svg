import { HtmlElement } from "../reflect-html"

// ===== gauge test case

export function make_gauges() {
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
