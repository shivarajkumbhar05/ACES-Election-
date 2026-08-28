import { Schema, model, Document, Types } from "mongoose";

export type CandidateStatus = "ACTIVE" | "INACTIVE";

export interface ICandidate extends Document {
  name: string;
  enrollmentNo: string;
  className: string;
  positionId: Types.ObjectId;
  photoUrl?: string;
  symbolUrl?: string;
  status: CandidateStatus;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    name: { type: String, required: true, trim: true },
    enrollmentNo: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    positionId: { type: Schema.Types.ObjectId, ref: "Position", required: true, index: true },
    photoUrl: { type: String },
    symbolUrl: { type: String },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent the same enrollment number from being registered twice for the same position
CandidateSchema.index({ enrollmentNo: 1, positionId: 1 }, { unique: true });

export default model<ICandidate>("Candidate", CandidateSchema);
