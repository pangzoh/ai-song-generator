import { useState } from 'react';
import './SongGenerator.css';

const genreOptions = ['Pop', 'Indie', 'Electronic', 'R&B', 'Rock', 'Lo-fi', 'Hip-Hop', 'Jazz'];
const moodOptions = ['Dreamy', 'Fierce', 'Nostalgic', 'Electric', 'Melancholic', 'Confident'];
const themeOptions = ['Love', 'Rebellion', 'Night drive', 'Healing', 'City lights', 'Fresh start'];

export default function SongGenerator({ isLoading, onGenerate }) {
  const [form, setForm] = useState({
    genre: 'Pop',
    mood: 'Dreamy',
    theme: 'Love',
    tempo: 96,
    description: 'A beautiful melody about chasing dreams',
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

  return (
    <form className="song-generator" onSubmit={handleSubmit}>
      <div className="generator-header">
        <h2>Create Your Song</h2>
        <p>Describe your musical vision and let AI generate an original track</p>
      </div>

      <div className="form-row">
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
      </div>

      <div className="form-row">
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

      <label className="full-width">
        <span>Describe Your Song Idea</span>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="What's the story or feeling you want to capture?"
          rows="4"
          disabled={isLoading}
        />
      </label>

      <button type="submit" className="btn-generate" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Generating...
          </>
        ) : (
          '✨ Generate Song'
        )}
      </button>
    </form>
  );
}
