import { Schema, model, Document } from "mongoose";

export type AdminRole = "SUPER_ADMIN" | "HOD" | "ACES_COORDINATOR";

export interface IAdmin extends Document {
  username: string;
  passwordHash: string;
  role: AdminRole;
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["SUPER_ADMIN", "HOD", "ACES_COORDINATOR"], required: true },
    active: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IAdmin>("Admin", AdminSchema);
