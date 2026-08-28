import { Schema, model, Document } from "mongoose";

export type PositionCategory = "TYCO" | "SYCO";

export interface IPosition extends Document {
  name: string;
  category: PositionCategory;
  order: number;
  active: boolean;
}

const PositionSchema = new Schema<IPosition>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, enum: ["TYCO", "SYCO"], required: true },
    order: { type: Number, required: true, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IPosition>("Position", PositionSchema);
