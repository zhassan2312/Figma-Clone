# Figma Clone - Comprehensive Project Documentation

## 📋 Table of Contents
1. [Project Scope](#project-scope)
2. [Project Structure](#project-structure)
3. [Application Flow](#application-flow)
4. [Canvas Operations Flow](#canvas-operations-flow)
5. [Component Architecture](#component-architecture)
6. [Technical Implementation](#technical-implementation)

---

## 🎯 Project Scope

### Overview
**Figma Clone** is a collaborative real-time design application that replicates core Figma functionalities. It enables multiple users to work simultaneously on design projects with real-time synchronization, drawing tools, and collaborative features.

### Core Features
- **Real-time Collaboration**: Multiple users can work on the same canvas simultaneously
- **Drawing Tools**: Rectangle, Ellipse, Text, Star, Line, Arrow, Polygon, Image, Video, and Pencil drawing tools
- **Advanced Shape Controls**: Frame wrapping, grouping/ungrouping, rotation handles and property controls
- **Transform Tools**: Move tool (V), Scale tool (K), Hand tool (H) with keyboard shortcuts
- **Layer Management**: Create, select, move, delete, rotate, and scale layers with keyboard arrow key movement
- **User Authentication**: Secure registration and login system
- **Room Management**: Create and manage collaborative workspaces with editable room names
- **Live Cursors**: See other users' cursors and selections in real-time
- **File Upload**: Support for image and video layer insertion
- **Undo/Redo**: History management for user actions

### Technical Objectives
- Build a scalable real-time application using modern web technologies
- Implement robust authentication and authorization
- Create an intuitive and responsive user interface
- Ensure data consistency across multiple clients
- Maintain high performance with optimistic updates

### Target Users
- Designers and design teams
- Product managers and stakeholders
- Anyone needing collaborative design tools

### Keyboard Shortcuts
- **V** - Move/Selection tool
- **K** - Scale tool
- **H** - Hand tool (pan canvas)
- **R** - Rectangle tool
- **E** - Ellipse tool
- **T** - Text tool
- **F** - Frame tool
- **P** - Pencil tool
- **Arrow Keys** - Move selected layers (1px, 10px with Shift)
- **Ctrl/Cmd + A** - Select all layers
- **Ctrl/Cmd + C** - Copy selected layers
- **Ctrl/Cmd + X** - Cut selected layers
- **Ctrl/Cmd + V** - Paste layers
- **Ctrl/Cmd + D** - Duplicate selected layers
- **Ctrl/Cmd + Z** - Undo
- **Ctrl/Cmd + Y** - Redo
- **Ctrl/Cmd + G** - Group selected layers
- **Ctrl/Cmd + U** - Ungroup selected layers
- **Delete/Backspace** - Delete selected layers

---

## 🏗️ Project Structure

### Directory Overview
```
figma-clone/
├── prisma/                     # Database schema and migrations
│   └── schema.prisma           # Database models definition
├── public/                     # Static assets
│   ├── favicon.ico
│   ├── figma-logo.ico
│   └── figma-logo.svg
├── src/                        # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── actions/            # Server actions
│   │   │   ├── auth.ts         # Authentication actions
│   │   │   └── rooms.ts        # Room management actions
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # NextAuth API routes
│   │   │   └── liveblocks/     # Liveblocks authentication
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── page.tsx        # Dashboard main page
│   │   │   └── [id]/           # Dynamic room pages
│   │   │       └── page.tsx    # Individual room page
│   │   ├── signin/             # Authentication pages
│   │   ├── signup/
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   │   ├── canvas/             # Canvas-related components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── liveblocks/         # Liveblocks integration
│   │   ├── sidebars/           # Sidebar components
│   │   └── toolsbar/           # Toolbar components
│   ├── hooks/                  # Custom React hooks
│   ├── server/                 # Server-side code
│   │   ├── auth/               # Authentication configuration
│   │   └── db.ts               # Database connection
│   ├── styles/                 # CSS styles
│   ├── types.ts                # TypeScript type definitions
│   ├── utils.ts                # Utility functions
│   └── env.js                  # Environment validation
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── tailwind.config.ts          # Tailwind CSS configuration
```

### Core Technologies
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL
- **Authentication**: NextAuth.js with credentials provider
- **Real-time**: Liveblocks for collaborative features
- **Development**: ESLint, Prettier, Turbo

---

## 🔄 Application Flow

### 1. User Authentication Flow
```
Landing Page → Sign Up/Sign In → Authentication → Dashboard
```

**Step-by-step process:**
1. **Landing Page** (`/`)
   - User sees the welcome page with project overview
   - Options to sign in or sign up

2. **Registration** (`/signup`)
   - User enters email and password
   - Server validates input using Zod schemas
   - Password is hashed with bcryptjs
   - User record created in database
   - Automatic redirect to dashboard

3. **Login** (`/signin`)
   - User enters credentials
   - NextAuth.js validates against database
   - JWT session created
   - Redirect to dashboard

4. **Dashboard** (`/dashboard`)
   - User sees their rooms and shared rooms
   - Can create new rooms or join existing ones

### 2. Room Creation and Access Flow
```
Dashboard → Create Room → Room Canvas → Real-time Collaboration
```

**Step-by-step process:**
1. **Room Creation**
   - User clicks "Create Room" on dashboard
   - Server action creates new room in database
   - User becomes room owner
   - Automatic redirect to room canvas

2. **Room Access**
   - User clicks on existing room
   - Server validates access permissions
   - Room data loaded from database
   - Liveblocks room initialized
   - Canvas rendered with room data

3. **Collaboration Setup**
   - Liveblocks authenticates user
   - User joins real-time room
   - Initial presence and storage loaded
   - Canvas ready for collaboration

### 3. Room Sharing Flow
```
Room → Share Button → Invite Users → Real-time Access
```

**Step-by-step process:**
1. **Invitation Process**
   - Room owner enters email to invite
   - System checks if user exists
   - Room invitation created in database
   - Invited user gains access to room

2. **Access Verification**
   - System checks if user is owner or invited
   - Access granted or denied based on permissions
   - Real-time room access configured

---

## 🎨 Canvas Operations Flow

### 1. Tool Selection Flow
```
Toolbar → Tool Selection → Canvas Mode Change → Ready for Drawing
```

**Implementation:**
```typescript
// Tool selection changes canvas state
const [canvasState, setState] = useState<CanvasState>({
  mode: CanvasMode.None,
});

// When tool is selected
setState({
  mode: CanvasMode.Inserting,
  layerType: LayerType.Rectangle, // or Ellipse, Text
});
```

### 2. Shape Creation Flow
```
Tool Selected → Mouse Down → Mouse Move → Mouse Up → Layer Created
```

**Step-by-step process:**
1. **Tool Selection**
   - User selects rectangle, ellipse, or text tool
   - Canvas mode changes to `CanvasMode.Inserting`
   - Canvas ready to receive input

2. **Mouse Down (onPointerDown)**
   - Captures starting point
   - Records initial coordinates
   - Prepares for shape creation

3. **Mouse Move (onPointerMove)**
   - Updates shape dimensions in real-time
   - Shows preview of shape being drawn
   - Calculates width and height from drag distance

4. **Mouse Up (onPointerUp)**
   - Finalizes shape creation
   - Creates layer with final dimensions
   - Adds layer to Liveblocks storage
   - Updates layer IDs list
   - Resets canvas mode to `CanvasMode.None`

**Code Implementation:**
```typescript
const insertLayer = useMutation(
  ({ storage, setMyPresence }, layerType: LayerType, position: Point) => {
    const liveLayers = storage.get("layers");
    const liveLayerIds = storage.get("layerIds");
    const layerId = nanoid();
    
    // Create layer based on type
    let layer = new LiveObject({
      type: layerType,
      x: position.x,
      y: position.y,
      height: 100,
      width: 100,
      fill: { r: 217, g: 217, b: 217 },
      stroke: { r: 217, g: 217, b: 217 },
      opacity: 100,
    });
    
    // Add to storage
    liveLayerIds.push(layerId);
    liveLayers.set(layerId, layer);
    
    // Update selection
    setMyPresence({ selection: [layerId] }, { addToHistory: true });
  },
  [history]
);
```

### 3. Selection Flow
```
Click on Layer → Selection Highlighted → Selection Tools Available
```

**Step-by-step process:**
1. **Layer Click Detection**
   - Ray casting to find clicked layer
   - Check all layers for intersection with click point
   - Priority given to top-most layers

2. **Selection Update**
   - Update user presence with selected layer ID
   - Broadcast selection to other users
   - Show selection box around selected layer

3. **Selection Tools**
   - Resize handles appear on selection
   - Delete key becomes active
   - Color picker becomes available

### 4. Pencil Drawing Flow
```
Pencil Tool → Mouse Down → Path Recording → Mouse Up → Path Layer Created
```

**Step-by-step process:**
1. **Pencil Mode Activation**
   - Canvas mode changes to `CanvasMode.Pencil`
   - Ready to record path points

2. **Path Recording**
   - Records mouse/touch coordinates continuously
   - Includes pressure data for variable line width
   - Stores points in real-time array

3. **Path Completion**
   - Converts recorded points to SVG path
   - Creates PathLayer with path data
   - Adds to Liveblocks storage

**Code Implementation:**
```typescript
const insertPath = useMutation(
  ({ storage, setMyPresence }) => {
    const liveLayers = storage.get("layers");
    const liveLayerIds = storage.get("layerIds");
    const layerId = nanoid();
    
    if (pencilDraft && pencilDraft.length > 0) {
      const path = penPointsToPathPayer(pencilDraft, penColor);
      const layer = new LiveObject(path);
      
      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);
      setMyPresence({ pencilDraft: null });
    }
  },
  [pencilDraft, penColor]
);
```

### 5. Real-time Collaboration Flow
```
User Action → Liveblocks Mutation → Broadcast to All Users → UI Update
```

**Step-by-step process:**
1. **Local Action**
   - User performs action (draw, move, select)
   - Local UI updates optimistically
   - Action queued for broadcast

2. **Liveblocks Synchronization**
   - Mutation sent to Liveblocks servers
   - Conflict resolution applied
   - Consistent state maintained

3. **Broadcast to Collaborators**
   - All connected users receive update
   - Remote UI updates automatically
   - Cursors and selections synchronized

---

## 🧩 Component Architecture

### 1. Canvas Component (`src/components/canvas/Canvas.tsx`)

**Purpose**: Main drawing canvas that handles all user interactions and rendering.

**Key Responsibilities:**
- Renders all layers and visual elements
- Handles mouse/touch events for drawing and selection
- Manages canvas state (current tool, selections, camera)
- Integrates with Liveblocks for real-time collaboration

**Key Code Sections:**

```typescript
export default function Canvas({
  roomName,
  roomId,
  othersWithAccessToRoom,
}: {
  roomName: string;
  roomId: string;
  othersWithAccessToRoom: User[];
}) {
  // Storage loading check - prevents mutations before storage is ready
  const roomColor = useStorage((root) => root.roomColor);
  const layerIds = useStorage((root) => root.layerIds);
  
  if (roomColor === null || layerIds === null) {
    return <LoadingScreen />;
  }

  // Core state management
  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });

  // Liveblocks hooks for real-time features
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const deleteLayers = useDeleteLayers();
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
```

**Event Handlers:**
- `onPointerDown`: Initiates drawing/selection
- `onPointerMove`: Updates drawing/selection in progress
- `onPointerUp`: Completes drawing/selection action
- `onWheel`: Handles zoom functionality

### 2. Room Component (`src/components/liveblocks/Room.tsx`)

**Purpose**: Liveblocks integration wrapper that provides real-time collaboration context.

**Key Responsibilities:**
- Initializes Liveblocks provider and room
- Sets up authentication endpoint
- Defines initial presence and storage state
- Provides loading fallback UI

**Code Implementation:**
```typescript
export function Room({ children, roomId }: { children: ReactNode; roomId: string }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks">
      <RoomProvider
        id={roomId}
        initialPresence={{
          selection: [],      // Currently selected layers
          cursor: null,       // Cursor position
          penColor: null,     // Current pen color
          pencilDraft: null,  // Current pencil drawing
        }}
        initialStorage={{
          roomColor: { r: 30, g: 30, b: 30 },           // Room background
          layers: new LiveMap<string, LiveObject<Layer>>(), // All layers
          layerIds: new LiveList([]),                    // Layer order
        }}
      >
        <ClientSideSuspense fallback={<LoadingScreen />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
```

### 3. ToolsBar Component (`src/components/toolsbar/ToolsBar.tsx`)

**Purpose**: Provides drawing tools and canvas controls.

**Key Responsibilities:**
- Tool selection (Rectangle, Ellipse, Text, Pencil)
- Undo/Redo functionality
- Zoom controls
- Selection tools

**Tool Implementation Pattern:**
```typescript
// Each tool button follows this pattern
<IconButton
  onClick={() => setState({ mode: CanvasMode.Inserting, layerType: LayerType.Rectangle })}
  isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Rectangle}
  icon={RectangleIcon}
/>
```

### 4. LayerComponent (`src/components/canvas/LayerComponent.tsx`)

**Purpose**: Renders individual layers based on their type.

**Key Responsibilities:**
- Renders different layer types (Rectangle, Ellipse, Text, Path)
- Handles layer-specific styling and properties
- Manages layer selection visual feedback

**Type-specific Rendering:**
```typescript
export default function LayerComponent({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: LayerComponentProps) {
  switch (layer.type) {
    case LayerType.Rectangle:
      return <Rectangle id={id} layer={layer} onPointerDown={onPointerDown} />;
    case LayerType.Ellipse:
      return <Ellipse id={id} layer={layer} onPointerDown={onPointerDown} />;
    case LayerType.Text:
      return <Text id={id} layer={layer} onPointerDown={onPointerDown} />;
    case LayerType.Path:
      return <Path id={id} layer={layer} onPointerDown={onPointerDown} />;
    default:
      console.warn("Unknown layer type");
      return null;
  }
}
```

### 5. SelectionBox Component (`src/components/canvas/SelectionBox.tsx`)

**Purpose**: Provides visual feedback and resize handles for selected layers.

**Key Responsibilities:**
- Shows selection bounds around selected layers
- Provides resize handles for layer manipulation
- Handles drag operations for moving layers

**Selection Bounds Calculation:**
```typescript
const bounds = useSelectionBounds(); // Custom hook to calculate selection area

if (!bounds) return null;

return (
  <rect
    className="fill-transparent stroke-blue-500 stroke-1 pointer-events-none"
    style={{
      transform: `translate(${bounds.x}px, ${bounds.y}px)`,
    }}
    x={0}
    y={0}
    width={bounds.width}
    height={bounds.height}
  />
);
```

### 6. Sidebars Component (`src/components/sidebars/Sidebars.tsx`)

**Purpose**: Provides layer properties and color picker controls.

**Key Responsibilities:**
- Color picker for fill and stroke
- Layer opacity controls
- Layer management (rename, delete)
- User access and sharing controls

### 7. Dashboard Components

#### RoomsView (`src/components/dashboard/RoomsView.tsx`)
**Purpose**: Displays user's rooms and shared rooms in grid layout.

#### CreateRoom (`src/components/dashboard/CreateRoom.tsx`)
**Purpose**: Handles new room creation with server actions.

#### ConfirmationModal (`src/components/dashboard/ConfirmationModal.tsx`)
**Purpose**: Provides confirmation dialogs for destructive actions.

### 8. Authentication Components

**Purpose**: Handle user registration and login flows.

**Key Features:**
- Form validation with Zod schemas
- Password strength requirements
- Error handling and user feedback
- Automatic redirection after authentication

---

## 🔧 Technical Implementation

### 1. Real-time Collaboration (Liveblocks)

**Architecture:**
```typescript
// Storage Structure
interface Storage {
  roomColor: Color;                           // Room background color
  layers: LiveMap<string, LiveObject<Layer>>; // All layers in the room
  layerIds: LiveList<string>;                 // Layer rendering order
}

// Presence Structure
interface Presence {
  selection: string[];                        // Selected layer IDs
  cursor: Point | null;                       // Cursor position
  penColor: Color | null;                     // Current pen color
  pencilDraft: [x: number, y: number, pressure: number][] | null; // Drawing path
}
```

**Mutation Pattern:**
```typescript
const mutationExample = useMutation(
  ({ storage, setMyPresence }, ...args) => {
    // Access shared storage
    const layers = storage.get("layers");
    const layerIds = storage.get("layerIds");
    
    // Modify storage
    layers.set(layerId, newLayer);
    layerIds.push(layerId);
    
    // Update presence
    setMyPresence({ selection: [layerId] }, { addToHistory: true });
  },
  [dependencies]
);
```

### 2. State Management

**Canvas State Types:**
```typescript
export enum CanvasMode {
  None,           // Default state
  Pressing,       // Mouse pressed but not moving
  SelectionNet,   // Multi-selection with drag
  Translating,    // Moving selected layers
  Inserting,      // Drawing new shape
  Resizing,       // Resizing selected layer
  Pencil,         // Freehand drawing
  RightClick,     // Context menu
}

export type CanvasState = 
  | { mode: CanvasMode.None }
  | { mode: CanvasMode.Pressing; origin: Point }
  | { mode: CanvasMode.SelectionNet; origin: Point; current?: Point }
  | { mode: CanvasMode.Translating; current: Point }
  | { mode: CanvasMode.Inserting; layerType: LayerType }
  | { mode: CanvasMode.Resizing; initialBounds: XYWH; corner: Side }
  | { mode: CanvasMode.Pencil }
  | { mode: CanvasMode.RightClick; current: Point };
```

### 3. Database Integration

**Prisma Schema:**
```prisma
model Room {
  id          String       @id @default(cuid())
  owner       User         @relation("RoomOwner", fields: [ownerId], references: [id])
  ownerId     String
  createdAt   DateTime     @default(now())
  title       String       @default("Untitled")
  roomInvites RoomInvite[]
}

model RoomInvite {
  id     String @id @default(cuid())
  room   Room   @relation(fields: [roomId], references: [id], onDelete: Cascade)
  roomId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String

  @@unique([roomId, userId])
}
```

**Server Actions:**
```typescript
export async function createRoom() {
  const session = await auth();
  if (!session?.user.id) throw new Error("No user id found.");

  const room = await db.room.create({
    data: {
      owner: { connect: { id: session.user.id } },
    },
    select: { id: true },
  });

  redirect("/dashboard/" + room.id);
}
```

### 4. Authentication System

**NextAuth Configuration:**
```typescript
export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;
        const user = await getUserByEmail(email);
        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (passwordsMatch) return user;
        return null;
      },
    }),
  ],
  // ... additional configuration
};
```

### 5. Utility Functions

**Canvas Utilities:**
```typescript
// Convert pointer event to canvas coordinates
export function pointerEventToCanvasPoint(
  e: React.PointerEvent,
  camera: Camera,
): Point {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
  };
}

// Find layers intersecting with selection rectangle
export function findIntersectionLayersWithRectangle(
  layerIds: readonly string[],
  layers: ReadonlyMap<string, Layer>,
  a: Point,
  b: Point,
): string[] {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  return layerIds.filter((layerId) => {
    const layer = layers.get(layerId);
    if (!layer) return false;
    
    return (
      rect.x < layer.x + layer.width &&
      rect.x + rect.width > layer.x &&
      rect.y < layer.y + layer.height &&
      rect.y + rect.height > layer.y
    );
  });
}
```

### 6. Performance Optimizations

**Loading States:**
- Storage loading checks prevent premature mutations
- Suspense boundaries for proper loading states
- Optimistic updates for smooth user experience

**Memoization:**
- React.memo for expensive component renders
- useMemo for complex calculations
- useCallback for stable function references

**Efficient Updates:**
- Liveblocks conflict resolution for concurrent edits
- Minimal re-renders through selective subscriptions
- Debounced operations for high-frequency events

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Liveblocks account (for real-time features)

### Environment Setup
```env
# Authentication
AUTH_SECRET="your-secret-key"

# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Liveblocks
LIVEBLOCKS_PUBLIC_KEY="pk_live_..."
LIVEBLOCKS_SECRET_KEY="sk_live_..."
```

### Installation Steps
1. Clone repository and install dependencies
2. Set up environment variables
3. Run database migrations: `npm run db:push`
4. Start development server: `npm run dev`
5. Access application at `http://localhost:3000`

---

*This documentation provides a comprehensive overview of the Figma Clone project architecture, implementation details, and operational flows. Each component and system is designed to work together to create a seamless collaborative design experience.*
