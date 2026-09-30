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
app.use(express.json({ limit: '10mb' }));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage
const generatedSongs = new Map();

const moodOptions = ['Dreamy', 'Fierce', 'Nostalgic', 'Electric', 'Melancholic', 'Confident', 'Energetic', 'Calm'];
const genreOptions = ['Pop', 'Indie', 'Electronic', 'R&B', 'Rock', 'Lo-fi', 'Hip-Hop', 'Jazz', 'Soul', 'Ambient'];
const themeOptions = ['Love', 'Rebellion', 'Night drive', 'Healing', 'City lights', 'Fresh start', 'Adventure', 'Nostalgia'];

// Generate lyrics with streaming support
async function generateLyrics(params) {
  const {
    mood = 'Dreamy',
    genre = 'Pop',
    theme = 'Love',
    tempo = 96,
    description = 'A beautiful song',
    style = 'poetic', // poetic, storytelling, conversational
  } = params;

  const styleGuide = {
    poetic: 'Use metaphors, imagery, and lyrical language. Make it artistic and expressive.',
    storytelling: 'Tell a narrative story. Create a clear beginning, middle, and end.',
    conversational: 'Use natural, relatable language. Write like you\'re speaking to someone.',
  };

  const systemPrompt = `You are an expert lyricist and songwriter. Generate original lyrics for a ${mood.toLowerCase()} ${genre.toLowerCase()} song about ${theme.toLowerCase()}.

Style: ${styleGuide[style] || styleGuide.poetic}

User description: ${description}

Respond ONLY with valid JSON (no markdown, no code blocks). Use this exact structure:
{
  "title": "Song Title Here",
  "tagline": "One-line catchy description",
  "structure": "Verse 1 - Pre-Chorus - Chorus - Verse 2 - Pre-Chorus - Chorus - Bridge - Chorus - Outro",
  "verse1": {
    "lyrics": "Line 1\nLine 2\nLine 3\nLine 4",
    "mood": "The emotional tone"
  },
  "preChorus": {
    "lyrics": "Line 1\nLine 2",
    "mood": "Building tension or connection"
  },
  "chorus": {
    "lyrics": "Line 1\nLine 2\nLine 3\nLine 4",
    "mood": "Hook and main message",
    "hookLine": "The most catchy line"
  },
  "verse2": {
    "lyrics": "Line 1\nLine 2\nLine 3\nLine 4",
    "mood": "Development of story/emotion"
  },
  "bridge": {
    "lyrics": "Line 1\nLine 2\nLine 3\nLine 4",
    "mood": "Contrast or climax"
  },
  "outro": {
    "lyrics": "Line 1\nLine 2\nLine 3\nLine 4",
    "mood": "Resolution or fade out"
  },
  "chordProgression": ["Cmaj7", "G", "Am7", "Fmaj7"],
  "keySignature": "C Major",
  "lyricalThemes": ["theme1", "theme2", "theme3"]
}`;

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
          content: `Create a ${mood.toLowerCase()} ${genre.toLowerCase()} song for ${theme.toLowerCase()}.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 2500,
    });

    const content = response.choices[0].message.content.trim();
    
    // Try to extract JSON
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const songData = JSON.parse(jsonMatch[0]);

    return {
      id: uuidv4(),
      ...songData,
      mood,
      genre,
      theme,
      tempo,
      style,
      description,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating lyrics:', error);
    throw error;
  }
}

// Convert text to speech using ElevenLabs-style endpoint (mock for now)
async function synthesizeVoice(text, voice = 'default') {
  // In production, integrate with:
  // - ElevenLabs API (realistic voices)
  // - Google Cloud Text-to-Speech
  // - Azure Cognitive Services
  // For now, return a mock audio URL
  
  try {
    // TODO: Implement real voice synthesis
    return {
      audioUrl: `data:audio/mp3;base64,ID3...`, // Placeholder
      voice,
      duration: Math.ceil(text.length / 10), // Rough estimate
    };
  } catch (error) {
    console.error('Error synthesizing voice:', error);
    throw error;
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate lyrics
app.post('/api/lyrics/generate', async (req, res) => {
  try {
    const { mood, genre, theme, tempo, description, style } = req.body;

    if (!genre || !genreOptions.includes(genre)) {
      return res.status(400).json({
        error: 'Invalid genre',
        validGenres: genreOptions,
      });
    }

    const lyrics = await generateLyrics({
      mood,
      genre,
      theme,
      tempo,
      description,
      style,
    });

    generatedSongs.set(lyrics.id, lyrics);

    res.json({
      status: 'success',
      lyrics,
    });
  } catch (error) {
    console.error('Error in /api/lyrics/generate:', error);
    res.status(500).json({
      error: 'Failed to generate lyrics',
      message: error.message,
    });
  }
});

// Synthesize voice for a section
app.post('/api/voice/synthesize', async (req, res) => {
  try {
    const { text, voice = 'default', section } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audio = await synthesizeVoice(text, voice);

    res.json({
      status: 'success',
      audio,
      section,
    });
  } catch (error) {
    console.error('Error in /api/voice/synthesize:', error);
    res.status(500).json({
      error: 'Failed to synthesize voice',
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

// Error middleware
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
  console.log(`   Docs: POST http://localhost:${port}/api/lyrics/generate\n`);
});
