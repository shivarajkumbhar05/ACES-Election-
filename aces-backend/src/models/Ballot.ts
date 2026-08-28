import { Schema, model, Document, Types } from "mongoose";

export interface IBallot extends Document {
  electionId: Types.ObjectId;
  voterTokenId?: Types.ObjectId;
  submittedAt: Date;
  ballotHash: string;
}

const BallotSchema = new Schema<IBallot>({
  electionId: { type: Schema.Types.ObjectId, ref: "Election", required: true, index: true },
  voterTokenId: { type: Schema.Types.ObjectId, ref: "VoterToken" },
  submittedAt: { type: Date, default: Date.now },
  ballotHash: { type: String, required: true },
});

// CRITICAL: enforces one ballot per token per election at the database level.
// This is the ultimate backstop against duplicate votes (double-click, retries,
// multiple tabs, crafted requests) - independent of any application logic.
BallotSchema.index({ electionId: 1, voterTokenId: 1 }, { unique: true, partialFilterExpression: { voterTokenId: { $exists: true } } });

export default model<IBallot>("Ballot", BallotSchema);
