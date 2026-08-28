import ExcelJS from "exceljs";
import { computeResults, computeSummary } from "../services/resultService";
import VoterToken from "../models/VoterToken";

export async function buildResultsExcel(electionId: string): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ACES Election Portal";
  workbook.created = new Date();

  const summary = await computeSummary(electionId);
  const results = await computeResults(electionId);

  // Sheet 1: Election Summary
  const summarySheet = workbook.addWorksheet("Election Summary");
  summarySheet.columns = [
    { header: "Field", key: "field", width: 30 },
    { header: "Value", key: "value", width: 40 },
  ];
  summarySheet.addRows([
    { field: "College", value: "Kai. Kalyanrao (Balasaheb) Ingale Polytechnic College, Akkalkot" },
    { field: "Department", value: summary.election?.department },
    { field: "Election", value: summary.election?.name },
    { field: "Election Date", value: summary.election ? new Date(summary.election.startAt).toDateString() : "" },
    { field: "Eligible Students", value: summary.eligibleStudents },
    { field: "Votes Cast", value: summary.votesCast },
    { field: "Participation", value: `${summary.participationPercent}%` },
    { field: "Election Status", value: summary.election?.status },
  ]);
  summarySheet.getRow(1).font = { bold: true };

  // Sheet 2: Position Results
  const resultsSheet = workbook.addWorksheet("Position Results");
  resultsSheet.columns = [
    { header: "Position", key: "position", width: 22 },
    { header: "Candidate", key: "candidate", width: 28 },
    { header: "Votes", key: "votes", width: 12 },
    { header: "Percentage", key: "percentage", width: 14 },
    { header: "Status", key: "status", width: 14 },
  ];
  for (const pos of results) {
    for (const c of pos.candidates) {
      resultsSheet.addRow({
        position: pos.positionName,
        candidate: c.name,
        votes: c.votes,
        percentage: `${c.percentage}%`,
        status: pos.tie ? "TIE" : c.isWinner ? "Winner" : "",
      });
    }
  }
  resultsSheet.getRow(1).font = { bold: true };

  // Sheet 3: Participation (anonymized token identifiers only)
  const participationSheet = workbook.addWorksheet("Participation");
  participationSheet.columns = [
    { header: "Token Reference", key: "ref", width: 24 },
    { header: "Status", key: "status", width: 14 },
    { header: "Used At", key: "usedAt", width: 24 },
  ];
  const tokens = await VoterToken.find({ electionId }).select("tokenPreview status usedAt").lean();
  for (const t of tokens) {
    participationSheet.addRow({
      ref: `****-${t.tokenPreview}`,
      status: t.status,
      usedAt: t.usedAt ? new Date(t.usedAt).toLocaleString() : "",
    });
  }
  participationSheet.getRow(1).font = { bold: true };

  return workbook.xlsx.writeBuffer();
}
