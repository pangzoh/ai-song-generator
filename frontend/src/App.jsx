import { useState, useCallback } from 'react';
import axios from 'axios';
import * as Tone from 'tone';
import SongGenerator from './components/SongGenerator';
import SongDisplay from './components/SongDisplay';
import SongLibrary from './components/SongLibrary';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function App() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'library'

  // Fetch all songs on mount
  const fetchSongs = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/songs`);
      setSongs(response.data.songs || []);
    } catch (err) {
      console.error('Failed to fetch songs:', err);
    }
  }, []);

  // Generate a new song
  const handleGenerateSong = useCallback(
    async (params) => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await axios.post(`${API_URL}/api/songs/generate`, params);
        const song = response.data.song;
        setCurrentSong(song);
        setSongs((prev) => [song, ...prev]);
        setActiveTab('generate');
      } catch (err) {
        console.error('Error generating song:', err);
        setError(
          err.response?.data?.message || 'Failed to generate song. Check your API key and try again.'
        );
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  // Load a song from library
  const handleLoadSong = useCallback((song) => {
    setCurrentSong(song);
    setActiveTab('generate');
  }, []);

  // Delete a song
  const handleDeleteSong = useCallback(
    async (id) => {
      try {
        await axios.delete(`${API_URL}/api/songs/${id}`);
        setSongs((prev) => prev.filter((s) => s.id !== id));
        if (currentSong?.id === id) {
          setCurrentSong(null);
        }
      } catch (err) {
        console.error('Error deleting song:', err);
        setError('Failed to delete song');
      }
    },
    [currentSong]
  );

  // Play a melody using Tone.js
  const handlePlayMelody = useCallback(async (song) => {
    try {
      await Tone.start();
      const now = Tone.now();
      const synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.05,
          decay: 0.1,
          sustain: 0.3,
          release: 0.5,
        },
      }).toDestination();

      const notes = ['C4', 'E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'C4'];
      const durations = ['8n', '8n', '8n.', '16n', '8n', '8n.', '8n', 'quarter'];

      notes.forEach((note, i) => {
        synth.triggerAttackRelease(note, durations[i], now + i * 0.2);
      });
    } catch (err) {
      console.error('Error playing melody:', err);
    }
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🎵 AI Song Generator</h1>
          <p>Create original songs powered by AI</p>
        </div>
      </header>

      <div className="app-tabs">
        <button
          className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          Generate
        </button>
        <button
          className={`tab ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('library');
            fetchSongs();
          }}
        >
          Library ({songs.length})
        </button>
      </div>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {activeTab === 'generate' ? (
          <div className="generate-section">
            <SongGenerator
              isLoading={isGenerating}
              onGenerate={handleGenerateSong}
              onPlayMelody={handlePlayMelody}
            />
            {currentSong && (
              <SongDisplay
                song={currentSong}
                onDelete={() => handleDeleteSong(currentSong.id)}
                onPlayMelody={() => handlePlayMelody(currentSong)}
              />
            )}
          </div>
        ) : (
          <SongLibrary
            songs={songs}
            onSelectSong={handleLoadSong}
            onDeleteSong={handleDeleteSong}
          />
        )}
      </main>
    </div>
  );
}
