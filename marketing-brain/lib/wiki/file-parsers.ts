// 위키 파일 파서 — Excel, CSV, PDF, Google Sheets URL
// CDN(SheetJS, PDF.js) 동적 로드 — v0.1 패턴과 동일
//
// 각 파서는 ParsedPage[] 를 반환합니다. 사용자는 미리보기에서 선택 후 위키에 저장.

import type { WikiCategory } from "@/lib/wiki/types";

export interface ParsedPage {
  title: string;
  content: string;
  category: WikiCategory;
  tags: string[];
  source: string;
}

/* ── CDN 동적 로드 ── */

let xlsxLoadPromise: Promise<void> | null = null;

function loadXLSX(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).XLSX) return Promise.resolve();
  if (xlsxLoadPromise) return xlsxLoadPromise;

  xlsxLoadPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("SheetJS 로드 실패"));
    document.head.appendChild(s);
  });
  return xlsxLoadPromise;
}

let pdfLoadPromise: Promise<void> | null = null;

function loadPDFJS(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).pdfjsLib) return Promise.resolve();
  if (pdfLoadPromise) return pdfLoadPromise;

  pdfLoadPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
    s.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
      resolve();
    };
    s.onerror = () => reject(new Error("PDF.js 로드 실패"));
    document.head.appendChild(s);
  });
  return pdfLoadPromise;
}

/* ── CSV → 마크다운 표 ── */

export function csvToMarkdownTable(csv: string, sep = ","): string {
  if (!csv.trim()) return "_(비어있음)_";

  const rows: string[][] = [];
  for (const line of csv.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (c === sep && !inQ) {
        cells.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    cells.push(cur);
    rows.push(cells);
  }

  if (!rows.length) return "_(비어있음)_";

  const header = rows[0];
  const body = rows.slice(1);
  const truncated = body.length > 100;
  const display = body.slice(0, 100);
  const cell = (s: string) => (s || "").replace(/\|/g, "\\|").replace(/\n/g, " ");

  let md = "| " + header.map((h) => cell(h) || " ").join(" | ") + " |\n";
  md += "|" + header.map(() => "---").join("|") + "|\n";
  for (const r of display) {
    while (r.length < header.length) r.push("");
    md += "| " + r.map((c) => cell(c) || " ").join(" | ") + " |\n";
  }
  if (truncated) md += `\n_…${body.length}행 중 처음 100행 표시 (전체는 원본 파일 참고)_\n`;
  return md;
}

/* ── 파서 ── */

export async function parseExcelFile(file: File): Promise<ParsedPage[]> {
  await loadXLSX();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX = (window as any).XLSX;
  const ab = await file.arrayBuffer();
  const wb = XLSX.read(ab, { type: "array" });
  const baseName = file.name.replace(/\.\w+$/, "");

  return wb.SheetNames.map((name: string) => {
    const sheet = wb.Sheets[name];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    const md = csvToMarkdownTable(csv, ",");
    return {
      title: wb.SheetNames.length > 1 ? `${baseName} — ${name}` : baseName,
      content: `# ${name}\n\n출처: \`${file.name}\`  ·  업로드: ${new Date().toLocaleString("ko-KR")}\n\n${md}`,
      category: "기타" as WikiCategory,
      tags: ["업로드", "excel", name].filter(Boolean),
      source: `${file.name} / ${name}`,
    };
  });
}

export async function parseCsvFile(file: File, sep = ","): Promise<ParsedPage> {
  const text = await file.text();
  const md = csvToMarkdownTable(text, sep);
  return {
    title: file.name.replace(/\.\w+$/, ""),
    content: `# ${file.name}\n\n업로드: ${new Date().toLocaleString("ko-KR")}\n\n${md}`,
    category: "기타",
    tags: ["업로드", sep === "\t" ? "tsv" : "csv"],
    source: file.name,
  };
}

export async function parsePdfFile(file: File): Promise<ParsedPage> {
  await loadPDFJS();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjsLib = (window as any).pdfjsLib;
  const ab = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;

  const max = Math.min(pdf.numPages, 200);
  const parts: string[] = [];
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const txt = content.items.map((it: any) => it.str).join(" ").replace(/\s+/g, " ").trim();
    if (txt) parts.push(`## p.${i}\n\n${txt}`);
  }

  const meta = pdf.numPages > max ? `${max}/${pdf.numPages}페이지 (200페이지 제한)` : `${pdf.numPages}페이지`;
  return {
    title: file.name.replace(/\.pdf$/i, ""),
    content: `# ${file.name}\n\n출처: \`${file.name}\`  ·  ${meta}  ·  업로드: ${new Date().toLocaleString("ko-KR")}\n\n${parts.join("\n\n") || "_(텍스트 추출 실패 — 스캔 PDF 가능성)_"}`,
    category: "기타",
    tags: ["업로드", "pdf"],
    source: file.name,
  };
}

export async function parseTextFile(file: File, category: WikiCategory = "기타"): Promise<ParsedPage> {
  const text = await file.text();
  return {
    title: file.name.replace(/\.\w+$/, ""),
    content: text || "_(빈 파일)_",
    category,
    tags: ["업로드", category === "가이드" ? "markdown" : "text"],
    source: file.name,
  };
}

/* ── 라우터: 확장자에 따라 적절한 파서 호출 ── */

export async function parseFile(file: File): Promise<ParsedPage[]> {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (["xlsx", "xls"].includes(ext)) return parseExcelFile(file);
  if (ext === "csv") return [await parseCsvFile(file, ",")];
  if (ext === "tsv") return [await parseCsvFile(file, "\t")];
  if (ext === "pdf") return [await parsePdfFile(file)];
  if (ext === "md") return [await parseTextFile(file, "가이드")];
  if (ext === "txt") return [await parseTextFile(file, "기타")];
  throw new Error(`지원하지 않는 형식: .${ext}`);
}

/* ── Google Sheets URL → CSV ── */

export async function fetchGoogleSheetsAsPage(url: string): Promise<ParsedPage> {
  const pubMatch = url.match(/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
  const stdMatch = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!pubMatch && !stdMatch) {
    throw new Error("구글 스프레드시트 URL이 아닙니다");
  }

  const gidM = url.match(/[#&?]gid=(\d+)/);
  const gid = gidM ? gidM[1] : "0";

  const endpoints: Array<{ name: string; url: string }> = [];
  if (pubMatch) {
    endpoints.push({
      name: "게시된 CSV",
      url: `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/pub?output=csv${gidM ? `&gid=${gid}` : ""}`,
    });
  }
  if (stdMatch) {
    endpoints.push(
      { name: "export", url: `https://docs.google.com/spreadsheets/d/${stdMatch[1]}/export?format=csv&gid=${gid}` },
      { name: "gviz", url: `https://docs.google.com/spreadsheets/d/${stdMatch[1]}/gviz/tq?tqx=out:csv&gid=${gid}` },
      { name: "gviz-default", url: `https://docs.google.com/spreadsheets/d/${stdMatch[1]}/gviz/tq?tqx=out:csv` }
    );
  }

  let lastErr = "";
  for (const ep of endpoints) {
    try {
      const resp = await fetch(ep.url, { redirect: "follow" });
      if (!resp.ok) { lastErr = `${ep.name}: HTTP ${resp.status}`; continue; }
      const text = await resp.text();
      if (!text.trim() || /<!DOCTYPE html>|<html/i.test(text.slice(0, 200))) {
        lastErr = `${ep.name}: 인증 페이지 (공개 아님)`;
        continue;
      }
      let csv = text;
      if (ep.name.startsWith("gviz")) csv = csv.replace(/^[)\]}'\s]+/, "").trim();

      const md = csvToMarkdownTable(csv, ",");
      const sheetIdShort = (pubMatch ? pubMatch[1] : stdMatch![1]).slice(0, 8);
      const title = `Google Sheets — ${sheetIdShort}${gidM ? ` (gid:${gid})` : ""}`;
      return {
        title,
        content: `# ${title}\n\n출처: ${ep.url}\n엔드포인트: ${ep.name}\n업로드: ${new Date().toLocaleString("ko-KR")}\n\n${md}`,
        category: "기타",
        tags: ["업로드", "google-sheets", ep.name],
        source: ep.url,
      };
    } catch (e) {
      lastErr = `${ep.name}: ${(e as Error).message}`;
    }
  }

  throw new Error(`모든 엔드포인트 실패 (${lastErr}) — 다운로드 → Excel 권장`);
}
