# Value Chain Creator

An interactive tool for mapping business value chains with drag-and-drop functionality, impact scoring, and relationship visualization.

## Features

### 🎯 Core Functionality
- **Visual Mapping**: Drag-and-drop interface using React Flow
- **Three Categories**: Upstream, Own Operations, Downstream
- **Impact Scoring**: Dual scoring system (1-10 scale)
- **Relationship Mapping**: Connect players with visual edges
- **AI Suggestions**: Smart recommendations for common industry players

### 📊 Data Management
- **Local Storage**: Automatic persistence between sessions
- **Export/Import**: JSON format for data portability
- **State Management**: Zustand store for efficient state handling
- **TypeScript**: Full type safety throughout

### 🎨 User Experience
- **Responsive Design**: Works on desktop and tablet
- **Real-time Updates**: Instant visual feedback
- **Tooltips**: Hover information for quick insights
- **Analysis Tab**: Metrics and insights dashboard

## Usage

1. **Create Value Chain**: Click "Create Value Chain" to start
2. **Add Players**: Use the sidebar to add new players
3. **Position Nodes**: Drag players to appropriate lanes
4. **Create Relationships**: Drag from one node to another
5. **Score Impacts**: Use sliders to set impact levels
6. **Export Data**: Download your value chain as JSON

## File Structure

```
src/components/value-chain/
├── ValueChainCreator.tsx    # Main component
├── ValueChainCanvas.tsx     # React Flow canvas
├── ValueChainSidebar.tsx    # Sidebar with controls
├── PlayerNode.tsx          # Individual player nodes
├── PlayerEditor.tsx        # Player creation/editing
└── README.md              # This file

src/store/
└── useValueChainStore.ts   # Zustand store

src/types/
└── valueChain.ts          # TypeScript interfaces
```

## Integration

The Value Chain Creator is integrated into the Materiality Assessment page as a new tab, allowing users to map their business ecosystem before conducting materiality assessments.

