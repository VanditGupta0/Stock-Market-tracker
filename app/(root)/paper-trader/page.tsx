import { getPaperTraderAccount } from '@/lib/actions/paperTrader.actions';
import PaperTraderClient from '@/components/paper-trader/PaperTraderClient';

const PaperTraderPage = async () => {
    const account = await getPaperTraderAccount();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="watchlist-title">Paper Trader</h1>
                <span className="text-sm text-gray-500">
                    Simulated trading at live prices. You make every trade.
                </span>
            </div>
            <PaperTraderClient initialAccount={account} />
        </div>
    );
};

export default PaperTraderPage;
