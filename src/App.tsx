import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import IngredientInput from '@/pages/IngredientInput'
import Recommend from '@/pages/Recommend'
import RecipeDetail from '@/pages/RecipeDetail'
import Favorites from '@/pages/Favorites'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IngredientInput />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </Router>
  )
}
