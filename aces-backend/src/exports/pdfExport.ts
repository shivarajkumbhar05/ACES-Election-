import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import crypto from "crypto";
import { computeResults, computeSummary, generateResultHash } from "../services/resultService";

export async function buildResultsPdf(electionId: string): Promise<Buffer> {
  const summary = await computeSummary(electionId);
  const results = await computeResults(electionId);
  const resultHash = await generateResultHash(electionId);
  const reportId = crypto.randomUUID();

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const stream = new PassThrough();
  const chunks: Buffer[] = [];
  stream.on("data", (chunk) => chunks.push(chunk as Buffer));
  doc.pipe(stream);

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("SHREE VATAVRUKSHA SWAMI MAHARAJ DEVASTHAN'S", { align: "center" });
  doc.text("KAI. KALYANRAO (BALASAHEB) INGALE POLYTECHNIC COLLEGE, AKKALKOT", { align: "center" });
  doc.text("COMPUTER ENGINEERING DEPARTMENT", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(18).text("ACES ELECTION RESULTS", { align: "center" });
  doc.moveDown(1);

  doc.fontSize(10).font("Helvetica");
  const startDate = summary.election ? new Date(summary.election.startAt).toLocaleString() : "-";
  doc.text(`Election Date: ${startDate}`);
  doc.text(`Election Status: ${summary.election?.status}`);
  doc.text(`Total Eligible Students: ${summary.eligibleStudents}`);
  doc.text(`Total Votes: ${summary.votesCast}`);
  doc.text(`Participation %: ${summary.participationPercent}%`);
  doc.moveDown(1);

  for (const pos of results) {
    doc.font("Helvetica-Bold").fontSize(13).text(pos.positionName);
    doc.font("Helvetica").fontSize(10);
    if (pos.tie) {
      doc.fillColor("red").text("TIE detected - administrative action required.").fillColor("black");
    }
    for (const c of pos.candidates) {
      const label = pos.tie ? "" : c.isWinner ? "  [WINNER]" : "";
      doc.text(`${c.name}  -  ${c.votes} votes  -  ${c.percentage}%${label}`);
    }
    doc.moveDown(0.75);
  }

  doc.moveDown(1);
  doc.font("Helvetica-Bold").text("ACES Coordinator: Nigadale G.A.");
  doc.text("HOD: Gaikawad S.T.");
  doc.moveDown(1);
  doc.font("Helvetica").fontSize(8);
  doc.text(`Report ID: ${reportId}`);
  doc.text(`Generated: ${new Date().toLocaleString()}`);
  doc.text(`Result Verification Hash (SHA-256): ${resultHash}`);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
