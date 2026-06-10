import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ToastContainer from "@/components/common/Toast";
import Home from "@/pages/Home";
import RegisterBook from "@/pages/RegisterBook";
import BookDetail from "@/pages/BookDetail";
import Statistics from "@/pages/Statistics";
import Profile from "@/pages/Profile";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterBook />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
      <ToastContainer />
    </Router>
  );
}
