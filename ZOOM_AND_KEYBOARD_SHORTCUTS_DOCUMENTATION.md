# Zoom and Keyboard Shortcuts Documentation

This document describes the comprehensive zoom functionality and keyboard shortcuts implemented in the Figma Clone application.

## Zoom Functionality

### Methods of Zooming

1. **Touchpad Pinch Gesture**: Use two fingers on a laptop trackpad and pinch in/out to zoom
   - Works on Windows laptops with precision touchpads
   - Works on MacBook trackpads
   - Automatically detected via Ctrl+wheel event combination

2. **Ctrl/Cmd + Mouse Wheel**: Hold Ctrl (Windows) or Cmd (Mac) and scroll with mouse wheel
   - Smooth, responsive zooming
   - Centers zoom on mouse cursor position

3. **Keyboard Shortcuts**:
   - `Ctrl/Cmd + +` or `Ctrl/Cmd + =`: Zoom in by 10%
   - `Ctrl/Cmd + -`: Zoom out by 10%
   - `Ctrl/Cmd + 0`: Reset zoom to 100%

4. **Toolbar Buttons**: Click the zoom in/out buttons in the toolbar
   - Located in the bottom toolbar
   - Shows visual feedback when buttons are disabled

### Zoom Features

- **Smart Centering**: When zooming with mouse wheel or touchpad, the zoom centers on the mouse cursor position
- **Zoom Limits**: Zoom level is constrained between 10% (0.1x) and 500% (5x)
- **Smooth Zooming**: Zoom increments are smooth and responsive (10% per step via keyboard, continuous via wheel)
- **Pan Mode**: Without holding Ctrl/Cmd, mouse wheel scrolls pan the canvas
- **Visual Feedback**: Zoom percentage indicator appears briefly during zoom operations
- **Zoom Persistence**: Zoom level is maintained throughout the session

## Keyboard Shortcuts

### Tool Selection Shortcuts
- `V`: Selection tool (move/select layers) - Shows "Select" indicator
- `R`: Rectangle tool - Shows "Rectangle" indicator  
- `E`: Ellipse tool - Shows "Ellipse" indicator
- `T`: Text tool - Shows "Text" indicator
- `F`: Frame tool - Shows "Frame" indicator
- `P`: Pencil/Path tool - Shows "Pencil" indicator
- `H`: Hand tool for panning - Shows "Hand Tool" indicator

### Edit Shortcuts
- `Ctrl/Cmd + A`: Select all layers
- `Ctrl/Cmd + C`: Copy selected layers to clipboard
- `Ctrl/Cmd + X`: Cut selected layers to clipboard
- `Ctrl/Cmd + V`: Paste layers from clipboard (offset by 20px)
- `Ctrl/Cmd + D`: Duplicate selected layers (offset by 20px)
- `Delete` or `Backspace`: Delete selected layers
- `Escape`: Clear selection
- `F2`: Rename selected layer (when only one layer is selected)

### History Shortcuts
- `Ctrl/Cmd + Z`: Undo last action
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y`: Redo last undone action

### Zoom Shortcuts
- `Ctrl/Cmd + +` or `Ctrl/Cmd + =`: Zoom in
- `Ctrl/Cmd + -`: Zoom out
- `Ctrl/Cmd + 0`: Reset zoom to 100%

## Visual Feedback

### Zoom Indicator
- Appears at the top center of the screen during zoom operations
- Shows current zoom percentage (e.g., "150%")
- Automatically fades out after 1.5 seconds
- Black background with white text for high contrast

### Tool Indicator  
- Appears below the zoom indicator when tools are changed via keyboard
- Shows the current tool name (e.g., "Rectangle", "Select")
- Blue background to distinguish from zoom indicator
- Automatically fades out after 1 second

## Technical Implementation

### Zoom Implementation Details

1. **Pinch Gesture Detection**: Uses `e.ctrlKey` with wheel events to detect trackpad pinch gestures
2. **Mouse-Centered Zooming**: Calculates the canvas point under the mouse and maintains it during zoom
3. **Camera System**: Uses a camera object with `{ x, y, zoom }` properties to control view transformation
4. **SVG Transform**: Applies zoom and pan via SVG `transform` attribute with hardware acceleration
5. **Event Prevention**: Prevents default scroll behavior and stops event propagation during zoom

### Keyboard Shortcuts Implementation

1. **Event Handling**: Uses a global keydown event listener with proper cleanup
2. **Input Field Detection**: Automatically disables shortcuts when typing in input fields, textareas, or contentEditable elements
3. **Modifier Key Support**: Handles Ctrl/Cmd combinations and Shift modifiers properly
4. **Tool State Management**: Updates canvas state to switch between tools with visual feedback
5. **Camera Control**: Directly updates camera state for zoom shortcuts with indicator display
6. **Cross-Platform**: Works on Windows (Ctrl) and Mac (Cmd) with proper key detection

### Performance Considerations

- Event handlers use `useCallback` to prevent unnecessary re-renders
- Zoom calculations are optimized for smooth 60fps performance
- Visual indicators use CSS transitions for smooth animations
- Event.preventDefault() only applied for handled keys to avoid conflicts
- Canvas transforms use hardware-accelerated CSS transforms
- Timeout cleanup prevents memory leaks for indicator timers

## Browser Compatibility

- **Chrome/Edge**: Full support for all features including trackpad gestures
- **Firefox**: Full support for all features including trackpad gestures  
- **Safari**: Full support for all features including trackpad gestures
- **Mobile**: Touch pinch gestures work on mobile devices

## Usage Tips

1. **Precise Zooming**: Hold Ctrl/Cmd while using mouse wheel for precise zoom control
2. **Quick Tool Switching**: Use single-letter shortcuts (R, E, T, F, P, V) for fast tool switching
3. **Zoom to Fit**: Use Ctrl/Cmd + 0 to quickly return to 100% zoom
4. **Layer Management**: Use Ctrl/Cmd + A to select all layers, then zoom to see everything
5. **Smooth Workflow**: Combine keyboard shortcuts with mouse/trackpad for efficient design workflow
6. **Visual Feedback**: Watch for zoom percentage and tool name indicators for confirmation
7. **Pan vs Zoom**: Use wheel without modifiers to pan, with Ctrl/Cmd to zoom

## Troubleshooting

### Trackpad Not Zooming
- Ensure you're holding Ctrl (Windows) or Cmd (Mac) while using trackpad gestures
- Check that your trackpad supports pinch gestures in system settings
- Try using two-finger scroll with Ctrl/Cmd held down

### Keyboard Shortcuts Not Working
- Make sure you're not typing in a text field or input
- Check that browser hasn't captured the shortcut (try in incognito/private mode)
- Verify Ctrl vs Cmd key usage based on your operating system

### Performance Issues
- Try reducing zoom level if canvas feels sluggish
- Close other browser tabs that might be using resources
- Check that hardware acceleration is enabled in browser settings

## Toolbar Improvements

### Visual Feedback
- **Active Tool Highlighting**: Selected tools now have a blue background instead of gray
- **Tooltips with Shortcuts**: Hover over any tool button to see the tool name and keyboard shortcut
- **Dropdown Shortcuts**: Tool dropdown menus show keyboard shortcuts next to each option
- **Persistent Icons**: Tool icons remain visible and switch dynamically based on selection

### Enhanced Tool Dropdowns
- **Selection Tools**: Move (V) and Hand tool (H) with shortcuts displayed
- **Shape Tools**: Rectangle (R) and Ellipse (E) with shortcuts displayed
- **Correct Icon Display**: Icons update correctly when switching tools and don't disappear

### Smart Icon Behavior
- Rectangle/Ellipse button shows the currently selected shape tool icon
- Frame button maintains its icon and tooltip
- All buttons show appropriate tooltips with keyboard shortcuts
