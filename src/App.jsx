import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import PodSystem from './components/PodSystem';
import Dashboard from './components/Dashboard';
import Catalogue from './components/Catalogue';
import Compliance from './components/Compliance';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <HowItWorks />
        <PodSystem />
        <Dashboard />
        <Catalogue />
        <Compliance />
      </main>
      <Footer />
    </>
  );
}

export default App;
