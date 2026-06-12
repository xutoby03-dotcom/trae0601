import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ProfilesList from "@/pages/ProfilesList";
import ProfileForm from "@/pages/ProfileForm";
import RecordsList from "@/pages/RecordsList";
import RecordForm from "@/pages/RecordForm";
import Trends from "@/pages/Trends";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profiles" element={<ProfilesList />} />
          <Route path="/profiles/new" element={<ProfileForm />} />
          <Route path="/profiles/:id/edit" element={<ProfileForm />} />
          <Route path="/records" element={<RecordsList />} />
          <Route path="/records/new" element={<RecordForm />} />
          <Route path="/records/:originalRecordId/retest" element={<RecordForm />} />
          <Route path="/trends" element={<Trends />} />
        </Route>
      </Routes>
    </Router>
  );
}
