import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from "./components/Main.jsx"
import PodcastDetail from "./components/podcastDetail.jsx"
import Popular from "./components/Popular.jsx"
import Recommended from "./components/Recommended.jsx"

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/podcast/:id" element={<PodcastDetail />} />
          <Route path="/popular" element={<Popular />} />
          <Route path="/recommended" element={<Recommended />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App