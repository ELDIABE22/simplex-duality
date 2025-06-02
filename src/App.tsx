import Header from './components/Header';
import MainContent from './components/MainContent';

function App() {
  return (
    <div className="min-h-screen flex flex-col gradient">
      {/* Círculos decorativos en el fondo */}
      {/* <div className="absolute top-10 left-20 w-16 h-16 bg-red-500 rounded-full blur-[40px] z-10"></div>
      <div className="absolute top-40 right-10 w-20 h-20 bg-green-500 rounded-full blur-[40px] z-10"></div>
      <div className="absolute bottom-20 left-1/3 w-12 h-12 bg-yellow-500 rounded-full blur-[40px] z-10"></div>
      <div className="absolute bottom-5 right-1/4 w-24 h-24 bg-purple-500 rounded-full blur-[40px] z-10"></div> */}

      <Header />
      <MainContent />
    </div>
  );
}

export default App;
