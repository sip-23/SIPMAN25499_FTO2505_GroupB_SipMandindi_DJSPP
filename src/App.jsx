import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from "./components/Home.jsx"
import PodcastDetail from "./components/podcastDetail.jsx"
import Popular from "./components/Popular.jsx"
import Recommended from "./components/Recommended.jsx"
import ResumePlaylistPage from "./components/ResumePodcast.jsx"
import { ThemeProvider } from './utilities/ThemeContext.jsx'
import { LayoutProvider } from './layouts/LayoutContext.jsx'
import { AudioProvider } from './utilities/AudioContext.jsx'
import GlobalAudioPlayer from './components/AudioPlayer.jsx'

function App() {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <AudioProvider>
          <Router>
            <div>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/podcast/:id" element={<PodcastDetail />} />
                <Route path="/popular" element={<Popular />} />
                <Route path="/recommended" element={<Recommended />} />
              </Routes>
              <GlobalAudioPlayer />
            </div>
          </Router>
        </AudioProvider>
      </LayoutProvider>
    </ThemeProvider>
  )
}

export default App