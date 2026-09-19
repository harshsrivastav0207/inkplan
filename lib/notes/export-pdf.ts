import jsPDF from "jspdf";

import type {
  Page,
  Stroke,
  StrokePoint,
} from "@/lib/db/types";

const PDF_WIDTH = 210;
const PDF_HEIGHT = 297;

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 1100;

const PAGE_MARGIN = 70;

function getPageBackground(theme: Page["theme"]) {
  switch (theme) {
    case "dark":
      return "#181818";

    case "warm":
      return "#fff8df";

    case "light":
    default:
      return "#ffffff";
  }
}

function getGridColor(theme: Page["theme"]) {
  if (theme === "dark") {
    return "rgba(255,255,255,0.10)";
  }

  return "rgba(0,0,0,0.08)";
}

function drawPageBackground(
  ctx: CanvasRenderingContext2D,
  page: Page,
) {
  ctx.fillStyle = getPageBackground(page.theme);

  ctx.fillRect(
    0,
    0,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  );

  ctx.strokeStyle = getGridColor(
    page.theme,
  );

  ctx.lineWidth = 1;

  if (page.pageType === "lined") {
    const lineSpacing = 70;

    for (
      let y = 120;
      y < CANVAS_HEIGHT - 40;
      y += lineSpacing
    ) {
      ctx.beginPath();
      ctx.moveTo(
        PAGE_MARGIN,
        y,
      );
      ctx.lineTo(
        CANVAS_WIDTH - PAGE_MARGIN,
        y,
      );
      ctx.stroke();
    }
  }

  if (page.pageType === "grid") {
    const gridSpacing = 60;

    for (
      let x = PAGE_MARGIN;
      x < CANVAS_WIDTH - PAGE_MARGIN;
      x += gridSpacing
    ) {
      ctx.beginPath();
      ctx.moveTo(x, PAGE_MARGIN);
      ctx.lineTo(
        x,
        CANVAS_HEIGHT - PAGE_MARGIN,
      );
      ctx.stroke();
    }

    for (
      let y = PAGE_MARGIN;
      y < CANVAS_HEIGHT - PAGE_MARGIN;
      y += gridSpacing
    ) {
      ctx.beginPath();
      ctx.moveTo(
        PAGE_MARGIN,
        y,
      );
      ctx.lineTo(
        CANVAS_WIDTH - PAGE_MARGIN,
        y,
      );
      ctx.stroke();
    }
  }

  if (page.pageType === "box") {
    const boxSpacing = 90;

    for (
      let x = PAGE_MARGIN;
      x < CANVAS_WIDTH - PAGE_MARGIN;
      x += boxSpacing
    ) {
      ctx.beginPath();
      ctx.moveTo(x, PAGE_MARGIN);
      ctx.lineTo(
        x,
        CANVAS_HEIGHT - PAGE_MARGIN,
      );
      ctx.stroke();
    }

    for (
      let y = PAGE_MARGIN;
      y < CANVAS_HEIGHT - PAGE_MARGIN;
      y += boxSpacing
    ) {
      ctx.beginPath();
      ctx.moveTo(
        PAGE_MARGIN,
        y,
      );
      ctx.lineTo(
        CANVAS_WIDTH - PAGE_MARGIN,
        y,
      );
      ctx.stroke();
    }
  }
}

function getStrokeBounds(
  strokes: Stroke[],
) {
  const points: StrokePoint[] = [];

  for (const stroke of strokes) {
    if (stroke.tool === "eraser") {
      continue;
    }

    points.push(...stroke.points);
  }

  if (points.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: CANVAS_WIDTH,
      maxY: CANVAS_HEIGHT,
    };
  }

  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;

  for (const point of points) {
    minX = Math.min(
      minX,
      point.x,
    );

    minY = Math.min(
      minY,
      point.y,
    );

    maxX = Math.max(
      maxX,
      point.x,
    );

    maxY = Math.max(
      maxY,
      point.y,
    );
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
  };
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  scale: number,
  offsetX: number,
  offsetY: number,
) {
  if (
    stroke.tool === "eraser" ||
    stroke.points.length === 0
  ) {
    return;
  }

  const points = stroke.points;

  ctx.save();

  ctx.globalAlpha =
    stroke.tool === "highlighter"
      ? Math.min(
          0.35,
          stroke.opacity,
        )
      : stroke.opacity;

  ctx.strokeStyle =
    stroke.color;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (
    stroke.tool === "highlighter"
  ) {
    ctx.globalCompositeOperation =
      "source-over";

    ctx.lineWidth =
      Math.max(
        stroke.size * 2.5,
        8,
      );
  } else {
    ctx.lineWidth =
      Math.max(
        stroke.size,
        1,
      );
  }

  if (points.length === 1) {
    const point = points[0];

    const pressure =
      Math.max(
        0.5,
        Math.min(
          1.2,
          point.pressure || 0.5,
        ),
      );

    const radius =
      (ctx.lineWidth *
        pressure) /
      2;

    ctx.beginPath();

    ctx.arc(
      point.x * scale +
        offsetX,
      point.y * scale +
        offsetY,
      radius,
      0,
      Math.PI * 2,
    );

    ctx.fillStyle =
      stroke.color;

    ctx.fill();

    ctx.restore();

    return;
  }

  ctx.beginPath();

  const first = points[0];

  ctx.moveTo(
    first.x * scale +
      offsetX,
    first.y * scale +
      offsetY,
  );

  for (
    let index = 1;
    index < points.length;
    index += 1
  ) {
    const point =
      points[index];

    ctx.lineTo(
      point.x * scale +
        offsetX,
      point.y * scale +
        offsetY,
    );
  }

  ctx.stroke();

  ctx.restore();
}

function drawStrokes(
  ctx: CanvasRenderingContext2D,
  page: Page,
) {
  const bounds =
    getStrokeBounds(
      page.strokes,
    );

  const contentWidth =
    Math.max(
      bounds.maxX - bounds.minX,
      1,
    );

  const contentHeight =
    Math.max(
      bounds.maxY - bounds.minY,
      1,
    );

  const availableWidth =
    CANVAS_WIDTH -
    PAGE_MARGIN * 2;

  const availableHeight =
    CANVAS_HEIGHT -
    PAGE_MARGIN * 2;

  const scale = Math.min(
    availableWidth /
      contentWidth,
    availableHeight /
      contentHeight,
    1,
  );

  const scaledWidth =
    contentWidth * scale;

  const scaledHeight =
    contentHeight * scale;

  const offsetX =
    PAGE_MARGIN +
    (availableWidth -
      scaledWidth) /
      2 -
    bounds.minX * scale;

  const offsetY =
    PAGE_MARGIN +
    (availableHeight -
      scaledHeight) /
      2 -
    bounds.minY * scale;

  for (const stroke of page.strokes) {
    drawStroke(
      ctx,
      stroke,
      scale,
      offsetX,
      offsetY,
    );
  }
}

function renderPageToCanvas(
  page: Page,
) {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width =
    CANVAS_WIDTH;

  canvas.height =
    CANVAS_HEIGHT;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "Unable to create PDF canvas.",
    );
  }

  drawPageBackground(
    ctx,
    page,
  );

  drawStrokes(
    ctx,
    page,
  );

  return canvas;
}

function safeFilename(
  title: string,
) {
  return (
    title
      .trim()
      .replace(
        /[^a-z0-9]+/gi,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      )
      .toLowerCase() ||
    "untitled"
  );
}

export function exportNoteAsPdf(
  title: string,
  pages: Page[],
) {
  if (pages.length === 0) {
    throw new Error(
      "There are no pages to export.",
    );
  }

  const pdf =
    new jsPDF({
      orientation:
        "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

  pages.forEach(
    (page, index) => {
      if (index > 0) {
        pdf.addPage(
          "a4",
          "portrait",
        );
      }

      const canvas =
        renderPageToCanvas(
          page,
        );

      const imageData =
        canvas.toDataURL(
          "image/png",
        );

      const imageWidth =
        PDF_WIDTH;

      const imageHeight =
        imageWidth *
        (CANVAS_HEIGHT /
          CANVAS_WIDTH);

      const imageY =
        (PDF_HEIGHT -
          imageHeight) /
        2;

      pdf.addImage(
        imageData,
        "PNG",
        0,
        imageY,
        imageWidth,
        imageHeight,
        undefined,
        "FAST",
      );
    },
  );

  pdf.save(
    `inkplan-${safeFilename(
      title,
    )}.pdf`,
  );
}