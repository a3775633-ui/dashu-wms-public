function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cell(value) {
  const type = typeof value === "number" && Number.isFinite(value) ? "Number" : "String";
  return `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
}

function safeSheetName(value, index) {
  const normalized = String(value || `工作表${index + 1}`).replace(/[\\/:?*\[\]]/g, "_").slice(0, 31);
  return normalized || `工作表${index + 1}`;
}

export function createSpreadsheetMlWorkbook(sheets) {
  if (!Array.isArray(sheets) || sheets.length === 0) throw new TypeError("工作簿沒有工作表");
  const usedNames = new Set();
  const worksheets = sheets.map((sheet, index) => {
    if (!Array.isArray(sheet.columns) || !Array.isArray(sheet.rows)) throw new TypeError("工作表格式錯誤");
    let name = safeSheetName(sheet.name, index);
    if (usedNames.has(name)) name = `${name.slice(0, 27)}_${index + 1}`;
    usedNames.add(name);
    const rows = [sheet.columns, ...sheet.rows]
      .map((row) => `<Row>${row.map(cell).join("")}</Row>`)
      .join("");
    return `<Worksheet ss:Name="${escapeXml(name)}"><Table>${rows}</Table></Worksheet>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${worksheets}</Workbook>`;
}

const encoder = new TextEncoder();

function uint16(value) {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function uint32(value) {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function columnName(index) {
  let value = index + 1;
  let name = "";
  while (value > 0) {
    value -= 1;
    name = String.fromCharCode(65 + (value % 26)) + name;
    value = Math.floor(value / 26);
  }
  return name;
}

function xlsxCell(value, rowIndex, columnIndex, header) {
  const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
  const style = header ? ' s="1"' : "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${reference}"${style} t="n"><v>${value}</v></c>`;
  }
  return `<c r="${reference}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function worksheetXml(sheet) {
  const rows = [sheet.columns, ...sheet.rows].map((row, rowIndex) =>
    `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => xlsxCell(value, rowIndex, columnIndex, rowIndex === 0)).join("")}</row>`
  ).join("");
  const maximumColumns = Math.max(sheet.columns.length, ...sheet.rows.map((row) => row.length), 1);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="${maximumColumns}" width="18" customWidth="1"/></cols><sheetData>${rows}</sheetData><autoFilter ref="A1:${columnName(maximumColumns - 1)}1"/></worksheet>`;
}

function zipStored(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = typeof entry.data === "string" ? encoder.encode(entry.data) : entry.data;
    const checksum = crc32(data);
    const local = new Uint8Array([
      ...uint32(0x04034b50), ...uint16(20), ...uint16(0x0800), ...uint16(0), ...uint16(0), ...uint16(0),
      ...uint32(checksum), ...uint32(data.length), ...uint32(data.length), ...uint16(name.length), ...uint16(0), ...name
    ]);
    localParts.push(local, data);
    const central = new Uint8Array([
      ...uint32(0x02014b50), ...uint16(20), ...uint16(20), ...uint16(0x0800), ...uint16(0), ...uint16(0), ...uint16(0),
      ...uint32(checksum), ...uint32(data.length), ...uint32(data.length), ...uint16(name.length), ...uint16(0), ...uint16(0),
      ...uint16(0), ...uint16(0), ...uint32(0), ...uint32(offset), ...name
    ]);
    centralParts.push(central);
    offset += local.length + data.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array([
    ...uint32(0x06054b50), ...uint16(0), ...uint16(0), ...uint16(entries.length), ...uint16(entries.length),
    ...uint32(centralSize), ...uint32(offset), ...uint16(0)
  ]);
  const parts = [...localParts, ...centralParts, end];
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let cursor = 0;
  for (const part of parts) {
    output.set(part, cursor);
    cursor += part.length;
  }
  return output;
}

export function createXlsxWorkbook(sheets) {
  if (!Array.isArray(sheets) || sheets.length === 0) throw new TypeError("工作簿沒有工作表");
  const usedNames = new Set();
  const normalizedSheets = sheets.map((sheet, index) => {
    if (!Array.isArray(sheet.columns) || !Array.isArray(sheet.rows)) throw new TypeError("工作表格式錯誤");
    let name = safeSheetName(sheet.name, index);
    if (usedNames.has(name)) name = `${name.slice(0, 27)}_${index + 1}`;
    usedNames.add(name);
    return { ...sheet, name };
  });
  const overrides = normalizedSheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("");
  const workbookSheets = normalizedSheets.map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("");
  const workbookRelations = normalizedSheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("");
  const styleRelationId = normalizedSheets.length + 1;
  const entries = [
    { name: "[Content_Types].xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${overrides}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>` },
    { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>` },
    { name: "docProps/app.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>大樹 WMS 原型</Application></Properties>` },
    { name: "docProps/core.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>大樹 WMS 報表</dc:title><dc:creator>大樹 WMS 原型</dc:creator></cp:coreProperties>` },
    { name: "xl/workbook.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${workbookSheets}</sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${workbookRelations}<Relationship Id="rId${styleRelationId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: "xl/styles.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0E7658"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs></styleSheet>` },
    ...normalizedSheets.map((sheet, index) => ({ name: `xl/worksheets/sheet${index + 1}.xml`, data: worksheetXml(sheet) }))
  ];
  return zipStored(entries);
}
