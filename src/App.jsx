import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from "./components/Home.jsx"
import PodcastDetail from "./components/PodcastDetail.jsx"
import Favourites from "./components/Favourites.jsx"
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
            <div className="pb-32">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/podcast/:id" element={<PodcastDetail />} />
                <Route path="/favourites" element={<Favourites />} />
                <Route path="/recommended" element={<Recommended />} />
                <Route path="/resume-playlist" element={<ResumePlaylistPage />}/>
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