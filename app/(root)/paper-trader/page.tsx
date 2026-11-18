import { getPaperTraderAccount } from '@/lib/actions/paperTrader.actions';
import PaperTraderClient from '@/components/paper-trader/PaperTraderClient';

const PaperTraderPage = async () => {
    const account = await getPaperTraderAccount();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="watchlist-title">AI Paper Trader</h1>
                <span className="text-sm text-gray-500">
                    Simulated trading powered by AI
                </span>
            </div>
            <PaperTraderClient initialAccount={account} />
        </div>
    );
};

export default PaperTraderPage;
