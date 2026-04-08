import * as XLSX from "xlsx";

class response {
  constructor(ok, reason = "") {
    this.ok = ok;
    this.reason = reason;
  }
}

function checkFormatExcel({ sheet }) {
  const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const requiredHeaders = [
    "Index",
    "Content",
    "Image Url",
    "Type",
    "Explanation",
    "Point",
    "Is Required",
    "Order",
    "Choices",
    "Is Correct",
  ];

  const headerRow = sheetData[0] || [];

  const missingHeaders = requiredHeaders.filter((h) => !headerRow.includes(h));
  if (missingHeaders.length > 0) {
    return new response(false, "Thiếu các cột: " + missingHeaders.join(", "));
  }

  const jsonData = XLSX.utils.sheet_to_json(sheet);

  const validTypes = ["MultiSelectChoice", "MultipleChoice", "TrueFalse"];
  const errors = [];

  jsonData.forEach((row, i) => {
    const rowNum = i + 2;

    const isQuestionRow = row["Index"] !== undefined && row["Index"] !== null;
    if (isQuestionRow) {
      if (!validTypes.includes(row["Type"])) {
        errors.push(`Dòng ${rowNum}: Type không hợp lệ (${row["Type"]})`);
      }

      if (isNaN(Number(row["Index"]))) {
        errors.push(`Dòng ${rowNum}: Index phải là số`);
      }
    } else {
      if (row["Choices"] === undefined) {
        errors.push(`Dòng ${rowNum}: thiếu Choices`);
      }
      if (row["Is Correct"] === undefined) {
        errors.push(`Dòng ${rowNum}: thiếu Is Correct`);
      }
    }
  });

  if (errors.length > 0) {
    return new response(false, "File Excel sai format:\n" + errors.join("\n"));
  }

  return new response(true);
}

export default checkFormatExcel;
