import { Schema, model, models, type Document, type Model } from 'mongoose';

/** Per-user stop-loss / take-profit rules for the AI paper trader. */
export interface PaperTraderRiskDoc extends Document {
    userId: string;
    enabled: boolean;
    stopLossPercent: number;
    takeProfitPercent: number;
}

const PaperTraderRiskSchema = new Schema<PaperTraderRiskDoc>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        enabled: { type: Boolean, default: true },
        stopLossPercent: { type: Number, default: 5 },
        takeProfitPercent: { type: Number, default: 10 },
    },
    { timestamps: true }
);

export const PaperTraderRisk: Model<PaperTraderRiskDoc> =
    (models?.PaperTraderRisk as Model<PaperTraderRiskDoc>) ||
    model<PaperTraderRiskDoc>('PaperTraderRisk', PaperTraderRiskSchema);
