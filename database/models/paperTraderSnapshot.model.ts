import { Schema, model, models, type Document, type Model } from 'mongoose';

/** One point on the portfolio performance chart (saved after every scan). */
export interface PaperTraderSnapshotDoc extends Document {
    userId: string;
    at: Date;
    portfolioValue: number;
    cash: number;
    invested: number;
}

const PaperTraderSnapshotSchema = new Schema<PaperTraderSnapshotDoc>({
    userId: { type: String, required: true, index: true },
    at: { type: Date, required: true, default: Date.now },
    portfolioValue: { type: Number, required: true },
    cash: { type: Number, required: true },
    invested: { type: Number, required: true },
});

PaperTraderSnapshotSchema.index({ userId: 1, at: 1 });

export const PaperTraderSnapshot: Model<PaperTraderSnapshotDoc> =
    (models?.PaperTraderSnapshot as Model<PaperTraderSnapshotDoc>) ||
    model<PaperTraderSnapshotDoc>('PaperTraderSnapshot', PaperTraderSnapshotSchema);
