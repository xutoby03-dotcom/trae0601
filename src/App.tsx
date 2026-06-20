import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Members from "@/pages/Members";
import Bags from "@/pages/Bags";
import Checklist from "@/pages/Checklist";
import SealCheck from "@/pages/SealCheck";
import PostCheck from "@/pages/PostCheck";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout title="看板首页" subtitle="实时掌握漂流物品清点状态" />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
        <Route element={<Layout title="成员档案" subtitle="管理漂流活动参与者信息" />}>
          <Route path="/members" element={<Members />} />
        </Route>
        <Route element={<Layout title="防水包档案" subtitle="管理所有防水包信息" />}>
          <Route path="/bags" element={<Bags />} />
        </Route>
        <Route element={<Layout title="出发前清点" subtitle="按包记录所有物品" />}>
          <Route path="/checklist" element={<Checklist />} />
        </Route>
        <Route element={<Layout title="入水前确认" subtitle="二次确认防水包密封状态" />}>
          <Route path="/seal-check" element={<SealCheck />} />
        </Route>
        <Route element={<Layout title="返程后检查" subtitle="检查进水、遗失、破损情况" />}>
          <Route path="/post-check" element={<PostCheck />} />
        </Route>
      </Routes>
    </Router>
  );
}
