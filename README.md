# AI Song Generator - Full Stack

A complete full-stack application that generates original songs with lyrics, chord progressions, and MIDI using AI. Features a polished React frontend, Node/Express backend, and OpenAI integration.

## Architecture

- **Frontend**: React + Vite (TypeScript-ready)
- **Backend**: Node.js + Express
- **AI Engine**: OpenAI API (GPT-4 for lyrics, optional music generation models)
- **Database**: MongoDB (optional, for saving generated songs)
- **Music**: Tone.js for MIDI playback, optional music generation API integration

## Features

- Real-time song generation with AI
- Custom lyrics based on mood, genre, theme, and description
- Chord progression generation
- Melody synthesis and MIDI playback
- Save and manage your generated songs
- Share songs via unique URLs
- Real-time progress streaming

## Project Structure

```
ai-song-generator/
├── frontend/          # React + Vite app
├── backend/           # Express API server
├── shared/            # Shared types and utilities
└─��� docker-compose.yml # Docker setup (optional)
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Add your OpenAI API key to .env
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=sk-...
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-song-generator (optional)
```

## API Endpoints

- `POST /api/songs/generate` - Generate a new song
- `GET /api/songs` - List all generated songs
- `GET /api/songs/:id` - Get a specific song
- `DELETE /api/songs/:id` - Delete a song

## Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
```

## License

MIT
