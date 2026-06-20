import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-stone-100 via-amber-50 to-rose-50 pb-8 pt-10">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4QjczNTUiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60"></div>
      
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-700 to-rose-600 text-white shadow-lg shadow-rose-200">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-800 sm:text-3xl">
              留香实验
            </h1>
            <p className="text-sm text-stone-500">记录每一缕香气的时光旅程</p>
          </div>
        </Link>
      </div>
      
      <div className="absolute -bottom-px left-0 right-0 h-8 bg-gradient-to-t from-stone-50 to-transparent"></div>
    </header>
  );
}
