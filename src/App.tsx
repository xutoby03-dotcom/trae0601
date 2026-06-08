import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FilmWall from '@/pages/FilmWall'
import MovieDetail from '@/pages/MovieDetail'
import QuoteDetail from '@/pages/QuoteDetail'
import AddQuote from '@/pages/AddQuote'
import ExcerptMode from '@/pages/ExcerptMode'
import Stats from '@/pages/Stats'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FilmWall />} />
        <Route path="/movie/:movieId" element={<MovieDetail />} />
        <Route path="/quote/:quoteId" element={<QuoteDetail />} />
        <Route path="/add" element={<AddQuote />} />
        <Route path="/excerpt" element={<ExcerptMode />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Router>
  )
}
