# D&D 5e Encounter Tracker

A comprehensive web application for tracking Dungeons & Dragons 5th Edition encounters, built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Character Management
- **Add Characters**: Create Player Characters (PCs), Non-Player Characters (NPCs), and Monsters
- **D&D 5e Stats**: Full support for all ability scores (STR, DEX, CON, INT, WIS, CHA)
- **Hit Points Tracking**: Track current, maximum, and temporary hit points
- **Character Details**: Store AC, speed, level, proficiency bonus, and notes
- **Condition Management**: Apply and track all standard D&D 5e conditions (Blinded, Charmed, Frightened, etc.)

### Encounter Creation
- **Multiple Encounters**: Create and save multiple encounters
- **Flexible Participant Selection**: Choose which characters participate in each encounter
- **Encounter Status**: Track active and inactive encounters

### Initiative Tracker
- **Automatic Initiative Rolling**: Roll initiative for all participants with their DEX modifiers
- **Initiative Order**: Automatically sorts participants by initiative
- **Round and Turn Tracking**: Keep track of the current round and whose turn it is
- **Visual Indicators**: Clearly shows the current turn with visual highlighting
- **Re-roll Initiatives**: Quickly re-roll all initiatives during an encounter

### Combat Management
- **HP Adjustment**: Quick buttons to add/subtract HP (+5, +1, -1, -5, or custom amounts)
- **HP Visualization**: Color-coded HP bars (green > 50%, yellow > 25%, red ≤ 25%)
- **Temporary HP**: Track temporary hit points separately
- **Condition Tracking**: Add and remove conditions during combat
- **Dynamic Participants**: Add new participants or remove existing ones mid-encounter
- **Ability Score Reference**: Quick reference to all ability modifiers

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd dnd-encounter-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage Guide

### 1. Adding Characters

1. Go to the **Characters** tab
2. Click the **+ Add Character** button
3. Fill in the character details:
   - Name, Type (PC/NPC/Monster)
   - Level and Armor Class
   - Hit Points
   - All six ability scores (modifiers are calculated automatically)
   - Speed and other details
4. Click **Add Character**

### 2. Creating an Encounter

1. Go to the **Encounters** tab
2. Click **+ Create Encounter**
3. Enter an encounter name
4. Select the characters that will participate
5. Click **Create Encounter**

### 3. Running Combat

1. From the Encounters tab, click **Start Encounter** on an encounter
2. The app automatically:
   - Rolls initiative for all participants
   - Sorts them by initiative order
   - Switches to the Initiative Tracker tab
3. Use the **Next Turn** button to advance through turns
4. Adjust HP using the quick buttons or custom values
5. Add/remove conditions as needed
6. Click **End Encounter** when combat is over

## Data Persistence

All data (characters and encounters) is saved to your browser's localStorage, so your data persists between sessions. Note that clearing browser data will delete all saved information.

## Technical Details

- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **Storage**: Browser localStorage

## Project Structure

```
dnd-encounter-tracker/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with GameProvider
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── CharacterForm.tsx  # Character creation form
│   ├── CharacterList.tsx  # Character list display
│   ├── EncounterManager.tsx # Encounter creation/management
│   └── InitiativeTracker.tsx # Combat initiative tracker
├── contexts/              # React contexts
│   └── GameContext.tsx    # Global game state management
└── types/                 # TypeScript type definitions
    └── dnd.ts             # D&D 5e types and utilities
```

## Features TODO

Future enhancements could include:
- Export/import encounters and characters
- Damage type tracking
- Spell slot tracking
- Death saving throws
- Notes for each participant
- Combat log history
- Custom conditions
- Monster stat blocks integration
- Dice roller

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

---

Happy adventuring! 🎲⚔️🐉

