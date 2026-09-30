import { useState, useRef } from 'react';
import axios from 'axios';
import './VoiceSynthesizer.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const voicePresets = [
  { value: 'default', label: '🎙️ Default' },
  { value: 'warm', label: '☀️ Warm' },
  { value: 'bright', label: '✨ Bright' },
  { value: 'deep', label: '🌊 Deep' },
  { value: 'soft', label: '💭 Soft' },
];

export default function VoiceSynthesizer({ song, playingSection, setPlayingSection }) {
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedSections, setSynthesizedSections] = useState({});
  const audioRefs = useRef({});

  const sections = [
    { key: 'verse1', title: '🎵 Verse 1', lyrics: song.verse1?.lyrics },
    { key: 'chorus', title: '🎤 Chorus', lyrics: song.chorus?.lyrics },
    { key: 'verse2', title: '🎵 Verse 2', lyrics: song.verse2?.lyrics },
    { key: 'bridge', title: '🌉 Bridge', lyrics: song.bridge?.lyrics },
  ].filter((s) => s.lyrics);

  const handleSynthesizeSection = async (sectionKey, lyrics) => {
    setIsSynthesizing(true);

    try {
      const response = await axios.post(`${API_URL}/api/voice/synthesize`, {
        text: lyrics,
        voice: selectedVoice,
        section: sectionKey,
      });

      if (response.data.audio) {
        setSynthesizedSections((prev) => ({
          ...prev,
          [sectionKey]: response.data.audio,
        }));
      }
    } catch (error) {
      console.error('Error synthesizing voice:', error);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handlePlaySection = (sectionKey) => {
    if (audioRefs.current[sectionKey]) {
      setPlayingSection(playingSection === sectionKey ? null : sectionKey);
      if (playingSection !== sectionKey) {
        audioRefs.current[sectionKey].play();
      }
    }
  };

  const handlePlayAll = async () => {
    // Play all sections in sequence
    for (const section of sections) {
      if (synthesizedSections[section.key]) {
        const audio = audioRefs.current[section.key];
        if (audio) {
          setPlayingSection(section.key);
          await new Promise((resolve) => {
            audio.onended = resolve;
            audio.play();
          });
        }
      }
    }
    setPlayingSection(null);
  };

  const handleDownloadAudio = (sectionKey) => {
    const audio = synthesizedSections[sectionKey];
    if (audio?.audioUrl) {
      const link = document.createElement('a');
      link.href = audio.audioUrl;
      link.download = `${song.title}-${sectionKey}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="voice-synthesizer">
      <div className="synthesizer-header">
        <h2>🎙️ Voice Synthesis</h2>
        <p>Convert your lyrics to speech with AI voice synthesis</p>
      </div>

      <div className="voice-controls">
        <div className="voice-selector">
          <label>
            <span>Voice Preset</span>
            <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} disabled={isSynthesizing}>
              {voicePresets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button className="btn-play-all" onClick={handlePlayAll} disabled={isSynthesizing}>
          ▶️ Play Full Song
        </button>
      </div>

      <div className="sections-grid">
        {sections.map((section) => {
          const isSynthesized = synthesizedSections[section.key];
          const isPlaying = playingSection === section.key;

          return (
            <div key={section.key} className="voice-section-card">
              <div className="card-header">
                <h3>{section.title}</h3>
                <div className="status-indicator">
                  {isSynthesized ? (
                    <span className="status-badge synthesized">✓ Ready</span>
                  ) : (
                    <span className="status-badge pending">⏳ Pending</span>
                  )}
                </div>
              </div>

              <div className="lyrics-preview">
                <p>{section.lyrics.substring(0, 100)}...</p>
              </div>

              <div className="section-actions">
                {!isSynthesized ? (
                  <button
                    className="btn-synthesize"
                    onClick={() => handleSynthesizeSection(section.key, section.lyrics)}
                    disabled={isSynthesizing}
                  >
                    {isSynthesizing ? (
                      <>
                        <span className="spinner"></span>
                        Synthesizing...
                      </>
                    ) : (
                      '🎚️ Synthesize'
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      className={`btn-play ${isPlaying ? 'playing' : ''}`}
                      onClick={() => handlePlaySection(section.key)}
                    >
                      {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                    </button>
                    <button
                      className="btn-download"
                      onClick={() => handleDownloadAudio(section.key)}
                      title="Download audio"
                    >
                      ⬇️
                    </button>
                  </>
                )}
              </div>

              {isSynthesized && (
                <audio
                  ref={(el) => {
                    if (el) audioRefs.current[section.key] = el;
                  }}
                  src={synthesizedSections[section.key]?.audioUrl}
                  onEnded={() => setPlayingSection(null)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="synthesis-info">
        <h4>💡 Tips for Better Results</h4>
        <ul>
          <li>Try different voice presets to find the best match for your song's mood</li>
          <li>Shorter sections synthesize faster and maintain better quality</li>
          <li>You can download individual sections and combine them in a DAW</li>
          <li>Experiment with the pre-chorus and bridge for dramatic effect</li>
        </ul>
      </div>
    </div>
  );
}
