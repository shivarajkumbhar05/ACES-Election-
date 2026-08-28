import { Schema, model, Document, Types } from "mongoose";

export type AuditAction =
  | "ADMIN_LOGIN"
  | "ADMIN_LOGIN_FAILED"
  | "CANDIDATE_CREATED"
  | "CANDIDATE_UPDATED"
  | "CANDIDATE_DELETED"
  | "TOKEN_GENERATED"
  | "TOKEN_IMPORTED"
  | "TOKEN_REVOKED"
  | "ELECTION_CREATED"
  | "ELECTION_STARTED"
  | "ELECTION_STOPPED"
  | "ELECTION_RESCHEDULED"
  | "ELECTION_ENDED"
  | "RESULT_EXPORTED"
  | "RESULTS_PUBLISHED";

export interface IAuditLog extends Document {
  adminId?: Types.ObjectId;
  action: AuditAction;
  description: string;
  electionId?: Types.ObjectId;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin" },
    action: { type: String, required: true, index: true },
    description: { type: String, required: true },
    electionId: { type: Schema.Types.ObjectId, ref: "Election", index: true },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IAuditLog>("AuditLog", AuditLogSchema);
