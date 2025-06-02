import { BookOpen } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white/50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-center items-center">
        <div className="flex items-center space-x-2 text-3xl">
          <BookOpen className="h-8 w-8 text-indigo-600" />
          <h1 className="font-bold text-gray-800">
            Solucionador de Dualidad PL
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
