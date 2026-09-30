import { useState } from 'react';
import './LyricsDisplay.css';

export default function LyricsDisplay({ song, onDelete, onPlayMelody }) {
  const [expandedSections, setExpandedSections] = useState({
    verse1: true,
    chorus: true,
    verse2: false,
    bridge: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderLyrics = (text) => {
    return text.split('\n').map((line, i) => (
      <p key={i}>{line || <br />}</p>
    ));
  };

  const sections = [
    { key: 'verse1', title: '🎵 Verse 1', data: song.verse1 },
    { key: 'preChorus', title: '🔝 Pre-Chorus', data: song.preChorus },
    { key: 'chorus', title: '🎤 Chorus', data: song.chorus, isHook: true },
    { key: 'verse2', title: '🎵 Verse 2', data: song.verse2 },
    { key: 'bridge', title: '🌉 Bridge', data: song.bridge },
    { key: 'outro', title: '🎬 Outro', data: song.outro },
  ];

  return (
    <div className="lyrics-display">
      <header className="lyrics-header">
        <div className="header-info">
          <h2>{song.title}</h2>
          <p className="tagline">{song.tagline}</p>
          <div className="meta-badges">
            <span className="badge">{song.mood}</span>
            <span className="badge">{song.genre}</span>
            <span className="badge">{song.keySignature}</span>
            <span className="badge">{song.tempo} BPM</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-play-melody" onClick={onPlayMelody} title="Play melody preview">
            ▶️ Play Melody
          </button>
          <button className="btn-delete-song" onClick={onDelete} title="Delete this song">
            🗑️
          </button>
        </div>
      </header>

      <div className="song-info">
        <div className="info-box">
          <h4>Structure</h4>
          <p>{song.structure}</p>
        </div>
        <div className="info-box">
          <h4>Themes</h4>
          <div className="themes-list">
            {song.lyricalThemes?.map((theme, i) => (
              <span key={i} className="theme-tag">
                {theme}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="lyrics-container">
        {sections.map(
          (section) =>
            section.data && (
              <div
                key={section.key}
                className={`lyrics-section ${expandedSections[section.key] ? 'expanded' : ''}`}
              >
                <div
                  className="section-header"
                  onClick={() => toggleSection(section.key)}
                >
                  <h3>{section.title}</h3>
                  <span className="toggle-icon">{expandedSections[section.key] ? '▼' : '▶'}</span>
                </div>

                {expandedSections[section.key] && (
                  <div className="section-content">
                    <div className={`lyrics-text ${section.isHook ? 'hook' : ''}`}>
                      {renderLyrics(section.data.lyrics)}
                    </div>
                    {section.isHook && section.data.hookLine && (
                      <div className="hook-highlight">
                        <p>💡 {section.data.hookLine}</p>
                      </div>
                    )}
                    {section.data.mood && (
                      <div className="section-mood">
                        <small>✨ {section.data.mood}</small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
        )}
      </div>

      <div className="song-footer">
        <div className="chords-section">
          <h4>Chord Progression</h4>
          <div className="chords-display">
            {song.chordProgression?.map((chord, i) => (
              <span key={i} className="chord-pill">
                {chord}
              </span>
            ))}
          </div>
        </div>
        <small className="generated-time">Generated on {new Date(song.createdAt).toLocaleString()}</small>
      </div>
    </div>
  );
}
