import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage (replace with MongoDB in production)
const generatedSongs = new Map();

// Types
const moodOptions = ['Dreamy', 'Fierce', 'Nostalgic', 'Electric', 'Melancholic', 'Confident'];
const genreOptions = ['Pop', 'Indie', 'Electronic', 'R&B', 'Rock', 'Lo-fi', 'Hip-Hop', 'Jazz'];
const themeOptions = ['Love', 'Rebellion', 'Night drive', 'Healing', 'City lights', 'Fresh start'];

// Helper: Generate song with AI
async function generateSongWithAI(params) {
  const {
    mood = 'Dreamy',
    genre = 'Pop',
    theme = 'Love',
    tempo = 96,
    description = 'A beautiful original song',
  } = params;

  const systemPrompt = `You are a talented songwriter and music producer. Generate an original song with:
- Mood: ${mood}
- Genre: ${genre}
- Theme: ${theme}
- Tempo: ${tempo} BPM
- User description: ${description}

Respond with a JSON object containing:
{
  "title": "Song Title",
  "verse": ["line 1", "line 2", "line 3", "line 4"],
  "chorus": "full chorus text",
  "bridge": "bridge lyrics",
  "chordProgression": ["Cmaj7", "G", ...],
  "key": "C Major",
  "summary": "brief description",
  "structure": "Verse-Chorus-Verse-Chorus-Bridge-Chorus"
}

Make the lyrics original, creative, and emotionally resonant. Chord progressions should match the mood and genre.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Generate a ${mood.toLowerCase()} ${genre.toLowerCase()} song about ${theme.toLowerCase()}.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse song data from AI response');
    }

    const songData = JSON.parse(jsonMatch[0]);

    return {
      id: uuidv4(),
      ...songData,
      mood,
      genre,
      theme,
      tempo,
      createdAt: new Date().toISOString(),
      description,
    };
  } catch (error) {
    console.error('Error generating song with AI:', error);
    throw error;
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate a new song
app.post('/api/songs/generate', async (req, res) => {
  try {
    const { mood, genre, theme, tempo, description } = req.body;

    // Validate inputs
    if (!mood || !genreOptions.includes(genre)) {
      return res.status(400).json({
        error: 'Invalid genre provided',
        validGenres: genreOptions,
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.write('{"status":"generating"\n');

    const song = await generateSongWithAI({
      mood,
      genre,
      theme,
      tempo: parseInt(tempo) || 96,
      description,
    });

    // Store the song
    generatedSongs.set(song.id, song);

    res.write(`,"song":${JSON.stringify(song)}}`);
    res.end();
  } catch (error) {
    console.error('Error in /api/songs/generate:', error);
    res.status(500).json({
      error: 'Failed to generate song',
      message: error.message,
    });
  }
});

// Get all songs
app.get('/api/songs', (req, res) => {
  try {
    const songs = Array.from(generatedSongs.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json({ songs, total: songs.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// Get a specific song
app.get('/api/songs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const song = generatedSongs.get(id);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(song);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch song' });
  }
});

// Delete a song
app.delete('/api/songs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = generatedSongs.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({ message: 'Song deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(port, () => {
  console.log(`\n🎵 AI Song Generator API running on http://localhost:${port}`);
  console.log(`   Health check: http://localhost:${port}/api/health\n`);
});
