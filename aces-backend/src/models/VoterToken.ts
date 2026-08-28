import { Schema, model, Document, Types } from "mongoose";

export type VoterTokenStatus = "ACTIVE" | "USED" | "REVOKED";

export interface IVoterToken extends Document {
  electionId: Types.ObjectId;
  tokenHash: string;
  tokenPreview: string; // last 4 chars only, for admin UI reference - never the full token
  status: VoterTokenStatus;
  usedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const VoterTokenSchema = new Schema<IVoterToken>(
  {
    electionId: { type: Schema.Types.ObjectId, ref: "Election", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    tokenPreview: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "USED", "REVOKED"], default: "ACTIVE", index: true },
    usedAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VoterTokenSchema.index({ electionId: 1, status: 1 });

export default model<IVoterToken>("VoterToken", VoterTokenSchema);
