import { Schema, model, Document, Types } from "mongoose";

export interface IVote extends Document {
  ballotId: Types.ObjectId;
  electionId: Types.ObjectId;
  positionId: Types.ObjectId;
  candidateId: Types.ObjectId;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    ballotId: { type: Schema.Types.ObjectId, ref: "Ballot", required: true, index: true },
    electionId: { type: Schema.Types.ObjectId, ref: "Election", required: true, index: true },
    positionId: { type: Schema.Types.ObjectId, ref: "Position", required: true, index: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Fast aggregation for tallying results per position/candidate.
VoteSchema.index({ electionId: 1, positionId: 1, candidateId: 1 });

export default model<IVote>("Vote", VoteSchema);
