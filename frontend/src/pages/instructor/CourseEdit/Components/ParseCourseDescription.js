function parseCourseDescription(text) {
  if (!text || typeof text !== "string") {
    return { description: "", outcomes: [], requirements: [] };
  }

  const normalized = text.replace(/\r/g, "");

  // Try to capture three sections using headings (flexible to presence/absence of colons)
  const headingRegex =
    /([\s\S]*?)\n?\s*(?:Kết\s+quả\s+đạt\s+được[:\s]*)\n([\s\S]*?)\n?\s*(?:Yêu\s+cầu[:\s]*)\n([\s\S]*)/i;
  const m = normalized.match(headingRegex);
  let desc = "";
  let outs = [];
  let reqs = [];

  if (m) {
    desc = m[1] || "";
    const outsBlock = m[2] || "";
    const reqsBlock = m[3] || "";

    const extractLines = (block) =>
      block
        .split(/\n+/)
        .map((l) => l.replace(/^\s*[-\u2022*\d.]+\s*/, "").trim())
        .filter((l) => l.length > 0);

    outs = extractLines(outsBlock);
    reqs = extractLines(reqsBlock);
  } else {
    // Fallback: try to split by the two headings if they exist anywhere
    const lower = normalized.toLowerCase();
    const outIndex = lower.indexOf("kết quả");
    const reqIndex = lower.indexOf("yêu cầu");

    if (outIndex !== -1 && reqIndex !== -1 && outIndex < reqIndex) {
      desc = normalized.slice(0, outIndex);
      const outsBlock = normalized.slice(outIndex, reqIndex);
      const reqsBlock = normalized.slice(reqIndex);

      const extract = (s) =>
        s
          .split(/\n+/)
          .map((l) =>
            l
              .replace(/^\s*[-\u2022*\d.]+\s*/, "")
              .replace(/^(kết|yêu).*/i, "")
              .trim()
          )
          .filter((l) => l.length > 0);

      outs = extract(outsBlock);
      reqs = extract(reqsBlock);
    } else {
      // Nothing to parse — return whole text as description
      desc = text;
    }
  }

  return { description: desc.trim(), outcomes: outs, requirements: reqs };
}

export { parseCourseDescription };
