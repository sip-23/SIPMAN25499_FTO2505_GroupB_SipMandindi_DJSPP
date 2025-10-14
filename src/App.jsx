import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from "./components/Main.jsx"
import PodcastDetail from "./components/podcastDetail.jsx"

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/podcast/:id" element={<PodcastDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App