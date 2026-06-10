import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "@/components/Nav";
import Home from "@/pages/Home";
import Members from "@/pages/Members";
import MemberForm from "@/pages/MemberForm";
import Record from "@/pages/Record";
import Stats from "@/pages/Stats";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/new" element={<MemberForm />} />
          <Route path="/members/:id/edit" element={<MemberForm />} />
          <Route path="/record" element={<Record />} />
          <Route path="/record/:memberId" element={<Record />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
        <Nav />
      </div>
    </Router>
  );
}
