import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import crypto from "crypto";
import { computeResults, computeSummary, generateResultHash } from "../services/resultService";

interface ColorHex {
  hex: string;
  name: string;
}

// Color scheme using hex values
const COLORS = {
  primary: "#0D47A1",      // Deep Blue
  secondary: "#663399",    // Purple
  success: "#228B22",      // Green
  warning: "#FF8C00",      // Orange
  danger: "#B22222",       // Dark Red
  light: "#F5F5F5",        // Light Gray
  dark: "#212121",         // Dark Gray
  white: "#FFFFFF",        // White
};

function drawRect(doc: PDFKit.PDFDocument, x: number, y: number, width: number, height: number, color: string, opacity = 1): void {
  doc.rect(x, y, width, height).fillOpacity(opacity).fill(color);
}

function drawLine(doc: PDFKit.PDFDocument, x1: number, y1: number, x2: number, y2: number, color: string = COLORS.light, width = 1): void {
  doc.strokeColor(color).lineWidth(width).moveTo(x1, y1).lineTo(x2, y2).stroke();
}

export async function buildResultsPdf(electionId: string): Promise<Buffer> {
  const summary = await computeSummary(electionId);
  const results = await computeResults(electionId);
  const resultHash = await generateResultHash(electionId);
  const reportId = crypto.randomUUID();

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const stream = new PassThrough();
  const chunks: Buffer[] = [];
  stream.on("data", (chunk) => chunks.push(chunk as Buffer));
  doc.pipe(stream);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;
  const contentWidth = pageWidth - 2 * margin;
  const secondaryMargin = margin + 20;

  // ==================== HEADER SECTION ====================
  drawRect(doc, 0, 0, pageWidth, 100, COLORS.primary);
  
  doc.fillColor(COLORS.white);
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("SHREE VATAVRUKSHA SWAMI MAHARAJ DEVASTHAN'S", secondaryMargin, 15, { width: contentWidth - 40 });
  
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("KAI. KALYANRAO (BALASAHEB) INGALE POLYTECHNIC COLLEGE, AKKALKOT", secondaryMargin, 28, { width: contentWidth - 40 });
  
  doc
    .fontSize(9)
    .font("Helvetica")
    .text("COMPUTER ENGINEERING DEPARTMENT", secondaryMargin, 45, { width: contentWidth - 40 });
  
  doc
    .fontSize(8)
    .font("Helvetica")
    .text(`Department: ${summary.election?.department || "Computer Engineering"}`, secondaryMargin, 58, { width: contentWidth - 40 });
  
  // Title
  doc.fillColor(COLORS.white);
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("📊 ELECTION RESULTS REPORT", secondaryMargin, 67);

  doc.moveDown(2.5);

  // ==================== ELECTION INFO CARDS ====================
  const cardY = doc.y;
  const cardWidth = (contentWidth - 20) / 4;
  const cardHeight = 65;

  interface InfoCard {
    label: string;
    value: string | number;
    color: string;
    icon: string;
  }

  const cards: InfoCard[] = [
    { label: "Eligible Voters", value: summary.eligibleStudents, color: COLORS.primary, icon: "👥" },
    { label: "Votes Cast", value: summary.votesCast, color: COLORS.success, icon: "✓" },
    { label: "Participation", value: `${summary.participationPercent}%`, color: COLORS.secondary, icon: "📈" },
    { label: "Status", value: summary.election?.status || "UNKNOWN", color: COLORS.warning, icon: "🔔" },
  ];

  cards.forEach((card, idx) => {
    const x = margin + idx * (cardWidth + 5);
    
    // Card background
    drawRect(doc, x, cardY, cardWidth, cardHeight, card.color, 0.1);
    doc.strokeColor(card.color).lineWidth(2).rect(x, cardY, cardWidth, cardHeight).stroke();
    
    // Icon
    doc.fillColor(card.color);
    doc.fontSize(24).text(card.icon, x + 10, cardY + 8, { width: cardWidth - 20 });
    
    // Label
    doc.fillColor(COLORS.dark);
    doc.fontSize(8).font("Helvetica").text(card.label, x + 10, cardY + 35, { width: cardWidth - 20 });
    
    // Value
    doc.fillColor(card.color);
    doc.fontSize(14).font("Helvetica-Bold").text(String(card.value), x + 10, cardY + 45, { width: cardWidth - 20 });
  });

  doc.y = cardY + cardHeight + 15;

  // ==================== ELECTION DETAILS ====================
  const detailsY = doc.y;
  doc.fillColor(COLORS.primary);
  doc.fontSize(11).font("Helvetica-Bold").text("📋 ELECTION DETAILS", margin, detailsY);
  
  drawLine(doc, margin, detailsY + 16, margin + contentWidth, detailsY + 16, COLORS.primary, 2);
  doc.moveDown(1.2);

  doc.fillColor(COLORS.dark);
  doc.fontSize(9).font("Helvetica");
  
  const electionName = summary.election?.name || "N/A";
  const startDate = summary.election ? new Date(summary.election.startAt).toLocaleString() : "-";
  const endDate = summary.election ? new Date(summary.election.endAt).toLocaleString() : "-";

  const detailsData = [
    ["Election Name:", electionName],
    ["Election Date (Start):", startDate],
    ["Election Date (End):", endDate],
    ["Total Eligible Students:", summary.eligibleStudents.toString()],
    ["Total Votes Cast:", summary.votesCast.toString()],
    ["Participation Rate:", `${summary.participationPercent}%`],
  ];

  detailsData.forEach((row, idx) => {
    doc.fillColor(idx % 2 === 0 ? COLORS.dark : COLORS.primary);
    doc.font("Helvetica-Bold").text(row[0], margin, doc.y, { width: 150 });
    doc.fillColor(COLORS.dark);
    doc.font("Helvetica").text(row[1], margin + 160, doc.y - doc.heightOfString(row[0]), { width: contentWidth - 160 });
    doc.moveDown(0.8);
  });

  doc.moveDown(0.8);

  // ==================== RESULTS SECTION ====================
  doc.fillColor(COLORS.primary);
  doc.fontSize(11).font("Helvetica-Bold").text("🏆 POSITION RESULTS", margin, doc.y);
  
  drawLine(doc, margin, doc.y + 16, margin + contentWidth, doc.y + 16, COLORS.primary, 2);
  doc.moveDown(1.5);

  // Results tables
  for (const position of results) {
    // Position header
    const posY = doc.y;
    drawRect(doc, margin, posY, contentWidth, 25, COLORS.secondary, 0.15);
    doc.strokeColor(COLORS.secondary).lineWidth(1).rect(margin, posY, contentWidth, 25).stroke();
    
    doc.fillColor(COLORS.secondary);
    doc.fontSize(10).font("Helvetica-Bold").text(position.positionName, margin + 10, posY + 5);
    
    if (position.tie) {
      doc.fillColor(COLORS.danger);
      doc.fontSize(8).font("Helvetica-Bold").text("⚠️  TIE DETECTED", margin + contentWidth - 100, posY + 8);
    }
    
    doc.y = posY + 25;

    // Table headers
    const tableHeaderY = doc.y;
    const rankWidth = 30;
    const nameWidth = 180;
    const votesWidth = 80;
    const percentWidth = 70;
    const statusWidth = contentWidth - rankWidth - nameWidth - votesWidth - percentWidth - 20;

    doc.fillColor(COLORS.white);
    drawRect(doc, margin, tableHeaderY, contentWidth, 20, COLORS.dark);

    doc.fontSize(8).font("Helvetica-Bold");
    doc.text("Rank", margin + 5, tableHeaderY + 5, { width: rankWidth });
    doc.text("Candidate", margin + rankWidth + 10, tableHeaderY + 5, { width: nameWidth });
    doc.text("Votes", margin + rankWidth + nameWidth + 10, tableHeaderY + 5, { width: votesWidth });
    doc.text("Percentage", margin + rankWidth + nameWidth + votesWidth + 10, tableHeaderY + 5, { width: percentWidth });
    doc.text("Status", margin + rankWidth + nameWidth + votesWidth + percentWidth + 10, tableHeaderY + 5, { width: statusWidth });

    doc.y = tableHeaderY + 20;

    // Candidate rows
    let rank = 1;
    for (const candidate of position.candidates) {
      const rowY = doc.y;
      const isWinner = !position.tie && candidate.isWinner;
      const rowColor = isWinner ? "#90EE90" : position.tie && candidate.isTied ? "#FFC87C" : COLORS.light;

      // Alternate row colors
      if (rank % 2 === 0) {
        drawRect(doc, margin, rowY, contentWidth, 18, rowColor, 0.5);
      }

      doc.fillColor(COLORS.dark);
      doc.fontSize(8).font("Helvetica");
      
      // Rank with medal
      let rankDisplay = rank.toString();
      if (rank === 1) rankDisplay += " 🥇";
      else if (rank === 2) rankDisplay += " 🥈";
      else if (rank === 3) rankDisplay += " 🥉";

      doc.text(rankDisplay, margin + 5, rowY + 3, { width: rankWidth });
      doc.text(candidate.name, margin + rankWidth + 10, rowY + 3, { width: nameWidth });
      doc.text(candidate.votes.toString(), margin + rankWidth + nameWidth + 10, rowY + 3, { width: votesWidth });
      doc.text(`${candidate.percentage}%`, margin + rankWidth + nameWidth + votesWidth + 10, rowY + 3, { width: percentWidth });

      // Status badge
      if (isWinner) {
        doc.fillColor(COLORS.success);
        doc.font("Helvetica-Bold").text("✓ WINNER", margin + rankWidth + nameWidth + votesWidth + percentWidth + 10, rowY + 3, { width: statusWidth });
      } else if (position.tie && candidate.isTied) {
        doc.fillColor(COLORS.warning);
        doc.font("Helvetica-Bold").text("⚠️  TIED", margin + rankWidth + nameWidth + votesWidth + percentWidth + 10, rowY + 3, { width: statusWidth });
      } else {
        doc.fillColor(COLORS.dark);
        doc.font("Helvetica").text("-", margin + rankWidth + nameWidth + votesWidth + percentWidth + 10, rowY + 3, { width: statusWidth });
      }

      doc.y = rowY + 18;
      rank++;
    }

    doc.moveDown(0.5);

    // Check if we need a new page
    if (doc.y > pageHeight - 150) {
      doc.addPage();
      doc.moveDown(1);
    }
  }

  // ==================== VERIFICATION & FOOTER ====================
  doc.moveDown(1);
  
  doc.fillColor(COLORS.primary);
  doc.fontSize(10).font("Helvetica-Bold").text("🔒 VERIFICATION & METADATA", margin, doc.y);
  
  drawLine(doc, margin, doc.y + 16, margin + contentWidth, doc.y + 16, COLORS.primary, 2);
  doc.moveDown(1.2);

  // Verification box
  const verifyY = doc.y;
  drawRect(doc, margin, verifyY, contentWidth, 60, COLORS.light);
  doc.strokeColor(COLORS.primary).lineWidth(1).rect(margin, verifyY, contentWidth, 60).stroke();

  doc.fillColor(COLORS.dark);
  doc.fontSize(8).font("Helvetica-Bold").text("Result Verification Hash (SHA-256):", margin + 10, verifyY + 5);
  
  doc.fillColor(COLORS.primary);
  doc.fontSize(7).font("Helvetica-Bold");
  const hashParts = resultHash.match(/.{1,64}/g) || [resultHash];
  let hashY = verifyY + 18;
  for (const part of hashParts) {
    doc.text(part, margin + 10, hashY);
    hashY += 12;
  }

  doc.y = verifyY + 60 + 10;

  // Final metadata
  doc.fillColor(COLORS.dark);
  doc.fontSize(8).font("Helvetica");
  
  const finalData = [
    ["Report ID:", reportId],
    ["Generated:", new Date().toLocaleString()],
    ["ACES Coordinator:", "Nigadale G.A."],
    ["HOD:", "Gaikawad S.T."],
  ];

  finalData.forEach((row) => {
    doc.fillColor(COLORS.primary);
    doc.font("Helvetica-Bold").text(row[0], margin, doc.y, { width: 120 });
    doc.fillColor(COLORS.dark);
    doc.font("Helvetica").text(row[1], margin + 130, doc.y - doc.heightOfString(row[0]), { width: contentWidth - 130 });
    doc.moveDown(0.7);
  });

  // Footer line
  drawLine(doc, margin, doc.y, margin + contentWidth, doc.y, COLORS.primary, 2);
  
  doc.fillColor(COLORS.dark);
  doc.fontSize(8).font("Helvetica").text("© 2024 ACES Election Portal | All Rights Reserved", margin, doc.y + 5, { align: "center", width: contentWidth });
  
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
