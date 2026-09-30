import './SongDisplay.css';

export default function SongDisplay({ song, onDelete, onPlayMelody }) {
  if (!song) return null;

  return (
    <div className="song-display">
      <header className="song-header">
        <div>
          <h2>{song.title}</h2>
          <p className="song-summary">{song.summary}</p>
        </div>
        <div className="song-actions">
          <button className="btn-play" onClick={onPlayMelody} title="Play melody preview">
            ▶ Play
          </button>
          <button className="btn-delete" onClick={onDelete} title="Delete this song">
            🗑 Delete
          </button>
        </div>
      </header>

      <div className="song-meta">
        <span className="badge">{song.mood}</span>
        <span className="badge">{song.genre}</span>
        <span className="badge">{song.key}</span>
        <span className="badge">{song.tempo} BPM</span>
      </div>

      <div className="song-content">
        <section className="song-section">
          <h3>Verse</h3>
          <div className="lyrics">
            {song.verse?.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </section>

        <section className="song-section">
          <h3>Chorus</h3>
          <p className="lyrics chorus">{song.chorus}</p>
        </section>

        <section className="song-section">
          <h3>Bridge</h3>
          <p className="lyrics">{song.bridge}</p>
        </section>

        <section className="song-section">
          <h3>Chord Progression</h3>
          <div className="chords">
            {song.chordProgression?.map((chord, i) => (
              <span key={i} className="chord-badge">
                {chord}
              </span>
            ))}
          </div>
        </section>
      </div>

      <footer className="song-footer">
        <small>Generated on {new Date(song.createdAt).toLocaleString()}</small>
      </footer>
    </div>
  );
}
