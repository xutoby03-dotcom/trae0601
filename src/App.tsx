import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import CreateGame from '@/pages/CreateGame'
import GameDetail from '@/pages/GameDetail'
import Stats from '@/pages/Stats'
import UserSetup from '@/components/UserSetup'
import { useGameStore } from '@/store/useGameStore'

export default function App() {
  const currentUserId = useGameStore(s => s.currentUserId)

  if (!currentUserId) {
    return <UserSetup />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateGame />} />
        <Route path="/game/:gameId" element={<GameDetail />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  )
}
