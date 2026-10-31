import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreateChallenge from './pages/CreateChallenge';
import JoinChallenge from './pages/JoinChallenge';
import PlayQuiz from './pages/PlayQuiz';
import Auction from "./pages/Auction";
import AuctionItems from "./pages/AuctionItems";
import LiveAuction from './pages/LiveAuction';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateChallenge />} />
            <Route path="/join" element={<JoinChallenge />} />
            <Route path="/play/:pin" element={<PlayQuiz />} />
            <Route path="/play" element={<JoinChallenge />} />
            <Route path="/auction" element={<Auction />} />
            <Route path="/auction/items" element={<AuctionItems />} />
            <Route path="/auction/live" element={<LiveAuction />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
