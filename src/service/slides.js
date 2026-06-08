// Render a structured slide deck (from generateSlideDeck) into a .pptx file.
// Uses pptxgenjs in pure-JS mode (no headless browser), so it runs fine on the
// Node serverless runtime that backs the Telegram webhook route.

import PptxGenJS from "pptxgenjs";

// Dom-AI brand colors for the deck.
const ACCENT = "2563EB"; // blue
const DARK = "111827"; // near-black text
const LIGHT = "FFFFFF";

/**
 * Build a PowerPoint file from a deck object.
 * @param {{title:string, subtitle?:string, slides:{title:string,bullets:string[]}[]}} deck
 * @returns {Promise<{buffer:Buffer, filename:string}>}
 */
export async function buildPptx(deck) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.3 x 7.5 in (16:9)
  pptx.author = "Dom-AI";
  pptx.title = deck.title;

  // --- Title slide ---
  const cover = pptx.addSlide();
  cover.background = { color: ACCENT };
  cover.addText(deck.title, {
    x: 0.7,
    y: 2.4,
    w: 11.9,
    h: 1.8,
    fontSize: 40,
    bold: true,
    color: LIGHT,
    align: "left",
  });
  if (deck.subtitle) {
    cover.addText(deck.subtitle, {
      x: 0.7,
      y: 4.2,
      w: 11.9,
      h: 1,
      fontSize: 20,
      color: LIGHT,
      align: "left",
    });
  }
  cover.addText("Made with Dom-AI", {
    x: 0.7,
    y: 6.7,
    w: 6,
    h: 0.4,
    fontSize: 12,
    color: LIGHT,
    align: "left",
  });

  // --- Content slides ---
  for (const slide of deck.slides) {
    const s = pptx.addSlide();
    s.background = { color: LIGHT };

    s.addText(String(slide.title || "").trim() || " ", {
      x: 0.7,
      y: 0.5,
      w: 11.9,
      h: 1,
      fontSize: 28,
      bold: true,
      color: DARK,
      align: "left",
    });
    // Accent underline beneath the title.
    s.addShape(pptx.ShapeType.line, {
      x: 0.7,
      y: 1.5,
      w: 3,
      h: 0,
      line: { color: ACCENT, width: 3 },
    });

    const bullets = Array.isArray(slide.bullets) ? slide.bullets : [];
    const textObjs = bullets
      .map((b) => String(b || "").trim())
      .filter(Boolean)
      .map((b) => ({ text: b, options: { bullet: { indent: 20 }, paraSpaceAfter: 10 } }));

    if (textObjs.length) {
      s.addText(textObjs, {
        x: 0.9,
        y: 1.9,
        w: 11.5,
        h: 5,
        fontSize: 18,
        color: DARK,
        align: "left",
        valign: "top",
      });
    }
  }

  // pptxgenjs writes a Node Buffer with outputType "nodebuffer".
  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return { buffer, filename: makeFilename(deck.title) };
}

// Turn a deck title into a safe .pptx filename.
function makeFilename(title) {
  const base = String(title || "presentation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "presentation"}.pptx`;
}
