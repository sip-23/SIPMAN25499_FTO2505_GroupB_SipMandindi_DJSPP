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


/**
 * App Component
 *
 * The root component of the podcast web application.
 * Sets up global providers and routing for the application.
 *
 * 1. Providers:
 * - ThemeProvider: manages dark/light theme toggling across the app
 * - LayoutProvider: manages sidebar state and responsive layout
 * - AudioProvider: manages global audio playback, recently played episodes, and playlist state
 * 2. Routing:
 * 
 * @component
 *
 * @returns {JSX.Element} The application root with providers and routes.
 */
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