import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import GameList from "@/pages/GameList";
import GameForm from "@/pages/GameForm";
import GameDetail from "@/pages/GameDetail";
import GameEdit from "@/pages/GameEdit";
import LendPage from "@/pages/LendPage";
import ReturnPage from "@/pages/ReturnPage";
import RepairList from "@/pages/RepairList";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/games" element={<GameList />} />
          <Route path="/games/new" element={<GameForm />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/games/:id/edit" element={<GameEdit />} />
          <Route path="/lend" element={<LendPage />} />
          <Route path="/return/:id" element={<ReturnPage />} />
          <Route path="/repairs" element={<RepairList />} />
        </Routes>
      </Layout>
    </Router>
  );
}
