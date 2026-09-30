import './SongLibrary.css';

export default function SongLibrary({ songs, onSelectSong, onDeleteSong }) {
  if (songs.length === 0) {
    return (
      <div className="song-library empty">
        <div className="empty-state">
          <h3>📚 Your Library is Empty</h3>
          <p>Generate your first song to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="song-library">
      <h2>Your Generated Songs</h2>
      <div className="songs-grid">
        {songs.map((song) => (
          <div key={song.id} className="song-card">
            <div className="card-header">
              <h3>{song.title}</h3>
              <button
                className="btn-delete-small"
                onClick={() => onDeleteSong(song.id)}
                title="Delete"
              >
                ×
              </button>
            </div>
            <p className="card-summary">{song.summary}</p>
            <div className="card-meta">
              <span>{song.mood}</span>
              <span>{song.genre}</span>
              <span>{song.tempo} BPM</span>
            </div>
            <button
              className="btn-load"
              onClick={() => onSelectSong(song)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
