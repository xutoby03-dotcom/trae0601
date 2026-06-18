import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { RecoveryPointsList } from "./pages/RecoveryPoints/List";
import { DropRegisterList } from "./pages/DropRegister/List";
import { SortingList } from "./pages/Sorting/List";
import { ExceptionsList } from "./pages/Exceptions/List";
import { StatisticsPage } from "./pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/recovery-points" element={<RecoveryPointsList />} />
          <Route path="/drop-register" element={<DropRegisterList />} />
          <Route path="/sorting" element={<SortingList />} />
          <Route path="/exceptions" element={<ExceptionsList />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
