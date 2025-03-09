import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConnectWalletPage from "./pages/connectwalletpage";
import DashboardPage from "./pages/dashboardPage";
import HomePage from "./pages/homepage";
import CreateNewSafe from "./pages/createNewSafe";
import WalletListener from "./components/walletListner";
import SafeDashboard from "./pages/safe";
import Transaction from "./pages/safeproperties/transaction";
import SafeOverview from "./pages/safeproperties/safeOverview";
import AddOwner from "./pages/safeproperties/addOwner";
import ChangeThreshold from "./pages/safeproperties/chageTreshold";
import RemoveOwner from "./pages/safeproperties/removeOwner";
import RemainingTransactions from "./pages/safeproperties/transactionsdetail/remainingTransactions";
import ExecutedTransactions from "./pages/safeproperties/transactionsdetail/executedTransactions";
import TransactionDetails from "./pages/safeproperties/transactionsdetail/transactionDetails";
export default function App() {
  return (
    <Router>
      <WalletListener />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/welcome" element={<ConnectWalletPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/create-new-safe" element={<CreateNewSafe />} />
        <Route path="/dashboard/safe" element={<SafeDashboard />} />
        <Route path="/dashboard/safe/over-view" element={<SafeOverview />} />
        <Route path="/dashboard/safe/add-owner" element={<AddOwner />} />
        <Route path="/dashboard/safe/threshold" element={<ChangeThreshold />} />
        <Route path="/dashboard/safe/remove-owner" element={<RemoveOwner />} />
        <Route path="/dashboard/safe/transactions" element={<Transaction />} />
        <Route path="/dashboard/safe/transactions/remaining-transactions" element={<RemainingTransactions />} />
        <Route path="/dashboard/safe/transactions/executed-transactions" element={<ExecutedTransactions />} />
        <Route path="/dashboard/safe/transactions/transaction-details" element={<TransactionDetails />} />
      </Routes>
    </Router>

  )
}