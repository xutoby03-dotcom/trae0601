import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import PetList from '@/pages/PetList';
import PetDetail from '@/pages/PetDetail';
import PetForm from '@/pages/PetForm';
import TaskList from '@/pages/TaskList';
import TaskDetail from '@/pages/TaskDetail';
import TaskForm from '@/pages/TaskForm';
import CheckIn from '@/pages/CheckIn';
import Review from '@/pages/Review';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pets" element={<PetList />} />
          <Route path="/pets/new" element={<PetForm />} />
          <Route path="/pets/:id" element={<PetDetail />} />
          <Route path="/pets/:id/edit" element={<PetForm />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/tasks/:id/checkin" element={<CheckIn />} />
          <Route path="/tasks/:id/review" element={<Review />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}
