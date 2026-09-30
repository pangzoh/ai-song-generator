import { useState } from 'react';
import './LyricsGenerator.css';

const genreOptions = ['Pop', 'Indie', 'Electronic', 'R&B', 'Rock', 'Lo-fi', 'Hip-Hop', 'Jazz', 'Soul', 'Ambient'];
const moodOptions = ['Dreamy', 'Fierce', 'Nostalgic', 'Electric', 'Melancholic', 'Confident', 'Energetic', 'Calm'];
const themeOptions = ['Love', 'Rebellion', 'Night drive', 'Healing', 'City lights', 'Fresh start', 'Adventure', 'Nostalgia'];
const styleOptions = [
  { value: 'poetic', label: '✨ Poetic (Metaphors & Imagery)' },
  { value: 'storytelling', label: '📖 Storytelling (Narrative)' },
  { value: 'conversational', label: '💬 Conversational (Relatable)' },
];

export default function LyricsGenerator({ isLoading, onGenerate }) {
  const [form, setForm] = useState({
    genre: 'Pop',
    mood: 'Dreamy',
    theme: 'Love',
    style: 'poetic',
    tempo: 96,
    description: 'A meaningful song about life and growth',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'tempo' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(form);
  };

  const handleRandomize = () => {
    setForm({
      genre: genreOptions[Math.floor(Math.random() * genreOptions.length)],
      mood: moodOptions[Math.floor(Math.random() * moodOptions.length)],
      theme: themeOptions[Math.floor(Math.random() * themeOptions.length)],
      style: styleOptions[Math.floor(Math.random() * styleOptions.length)].value,
      tempo: 60 + Math.floor(Math.random() * 120),
      description: form.description,
    });
  };

  return (
    <form className="lyrics-generator" onSubmit={handleSubmit}>
      <div className="generator-header">
        <h2>Create Original Lyrics</h2>
        <p>Let AI craft personalized song lyrics based on your mood and style</p>
      </div>

      <div className="form-section">
        <div className="section-title">📊 Song Profile</div>
        <div className="form-grid">
          <label>
            <span>Genre</span>
            <select name="genre" value={form.genre} onChange={handleChange} disabled={isLoading}>
              {genreOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Mood</span>
            <select name="mood" value={form.mood} onChange={handleChange} disabled={isLoading}>
              {moodOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Theme</span>
            <select name="theme" value={form.theme} onChange={handleChange} disabled={isLoading}>
              {themeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Tempo (BPM)</span>
            <input
              type="number"
              name="tempo"
              value={form.tempo}
              onChange={handleChange}
              min="60"
              max="180"
              disabled={isLoading}
            />
          </label>
        </div>
      </div>

      <div className="form-section">
        <div className="section-title">🎨 Writing Style</div>
        <div className="style-options">
          {styleOptions.map((option) => (
            <label key={option.value} className="style-option">
              <input
                type="radio"
                name="style"
                value={option.value}
                checked={form.style === option.value}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="section-title">📝 Your Inspiration</div>
        <label className="full-width">
          <span>Describe your song idea</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What's the story or feeling you want to capture? Any specific elements or messages?"
            rows="4"
            disabled={isLoading}
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-generate" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Generating Lyrics...
            </>
          ) : (
            '✨ Generate Lyrics'
          )}
        </button>
        <button type="button" className="btn-random" onClick={handleRandomize} disabled={isLoading}>
          🎲 Surprise Me
        </button>
      </div>
    </form>
  );
}
