import { Schema, model, Document, Types } from "mongoose";

export type ElectionStatus = "SCHEDULED" | "LIVE" | "PAUSED" | "ENDED" | "RESULTS_PUBLISHED";

export interface IElection extends Document {
  name: string;
  department: string;
  status: ElectionStatus;
  startAt: Date;
  endAt: Date;
  endedAt?: Date;
  resultsPublished: boolean;
  resultHash?: string;
  createdBy: Types.ObjectId;
  endedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ElectionSchema = new Schema<IElection>(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, default: "Computer Engineering" },
    status: {
      type: String,
      enum: ["SCHEDULED", "LIVE", "PAUSED", "ENDED", "RESULTS_PUBLISHED"],
      default: "SCHEDULED",
      index: true,
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    endedAt: { type: Date },
    resultsPublished: { type: Boolean, default: false },
    resultHash: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    endedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

export default model<IElection>("Election", ElectionSchema);
