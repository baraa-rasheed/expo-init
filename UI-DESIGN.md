# ExpoInit - UI/UX Design Documentation

## Design Philosophy

ExpoInit follows a **modal-first, viewport-contained** design approach that prioritizes:
- **Focus**: Modals provide distraction-free experiences for complex selections
- **Clarity**: Non-scrollable main layout keeps everything visible
- **Efficiency**: Quick access to all features without scrolling
- **Beauty**: Modern, clean aesthetic with smooth interactions

## Layout Structure

### Viewport-Contained Design
The entire application fits within the viewport (100vh) with **no page scrolling**. This creates a more app-like experience.

```
┌─────────────────────────────────────────────────────┐
│ Header (Fixed)                                      │
├─────────────────────────────────────────────────────┤
│ ┌──────────┬──────────────┬──────────────────────┐ │
│ │          │              │                      │ │
│ │ Template │  Customize   │   Project Summary    │ │
│ │    &     │   Project    │         &            │ │
│ │  Config  │              │    Quick Tips        │ │
│ │          │  [Modules]   │                      │ │
│ │(scroll)  │              │     (scroll)         │ │
│ │          │[Dependencies]│                      │ │
│ │          │              │                      │ │
│ │          │  [Preview]   │                      │ │
│ └──────────┴──────────────┴──────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ Footer (Fixed)                                      │
└─────────────────────────────────────────────────────┘
```

### Three-Column Grid

#### Left Column (Scrollable)
- **Template Selection**: Dropdown with 4 Expo templates
- **App Configuration**: 5 input fields for core settings
- Scrollable when content exceeds viewport

#### Center Column (Fixed Height)
- **Customize Your Project Card**: Contains all action buttons
  - Expo Modules button (shows count)
  - Dependencies button (shows count)
  - Preview & Download button (primary CTA)
- Vertically centered with spacer

#### Right Column (Scrollable)
- **Project Summary**: Real-time stats
  - App name, version, modules, dependencies, plugins
- **Quick Tips**: Helpful guidance
- Scrollable when content exceeds viewport

## Modal System

### Design Principles
1. **Large & Readable**: max-w-4xl for comfortable viewing
2. **Scrollable Content**: Internal scroll for long lists
3. **Clear Actions**: Obvious selection states
4. **Easy Dismissal**: Click outside or ESC key

### Expo Modules Modal

**Trigger**: Button in center column showing module count

**Layout**:
- Header with title and description
- 2-column grid of module cards
- ScrollArea for browsing all modules
- 85vh max height

**Card Design**:
- Title and description
- Package badges at bottom
- Checkmark indicator when selected
- Ring highlight on selection
- Hover shadow effect
- Click anywhere to toggle

**Visual States**:
- **Unselected**: Default card style
- **Hover**: Shadow elevation
- **Selected**: Primary ring + checkmark badge

### Dependencies Modal

**Trigger**: Button in center column showing dependency count

**Layout**: Identical to Modules Modal
- 2-column grid
- Scrollable content
- Same card interaction pattern

**Card Design**:
- Package name as title
- Description
- Version badge (monospace font)
- Same selection indicators

### Preview Modal

**Trigger**: Large primary button "Preview & Download"

**Layout**:
- Tabbed interface (app.json / package.json)
- Copy button for each tab
- Large scrollable code display
- Download button at bottom

**Features**:
- **Copy Feedback**: Button changes to "Copied!" with checkmark
- **Syntax Display**: Monospace font, proper indentation
- **ScrollArea**: For long JSON files
- **Download**: Downloads both files simultaneously

## Interactive Elements

### Buttons

**Primary (Preview & Download)**:
- Full width in center column
- Large size (lg)
- Eye icon + text
- Primary color scheme

**Outline (Modal Triggers)**:
- Full width
- Tall height (py-4)
- Icon + title + count
- Left-aligned content
- Hover effects

**Ghost (Theme Toggle)**:
- Icon only
- Smooth icon transitions
- Dark/light mode aware

### Cards

**Selection Cards (Modals)**:
- Cursor pointer
- Transition-all for smooth effects
- Hover shadow
- Ring on selection
- Checkmark badge when selected

**Info Cards (Summary/Tips)**:
- Static display
- Clean typography
- Proper spacing
- Muted colors for secondary info

### Form Inputs

**Text Inputs**:
- Full width
- Clear labels
- Instant onChange updates
- Placeholder text
- Focus ring

**Select Dropdown**:
- Custom styled with Radix UI
- Template descriptions visible
- Smooth animations

## Color & Typography

### Color System
- **Primary**: Used for CTAs, highlights, icons
- **Muted**: Secondary text, borders
- **Background**: Adaptive light/dark
- **Ring**: Selection indicators

### Typography
- **Headings**: Bold, clear hierarchy
- **Body**: Readable size, proper line height
- **Code**: Monospace for technical content
- **Labels**: Muted foreground for form labels

## Responsive Behavior

### Desktop (lg+)
- Full 3-column layout
- Optimal spacing
- All features visible

### Tablet (md)
- 2-column layout
- Center column stacks
- Maintained functionality

### Mobile (sm)
- Single column
- Stacked sections
- Full-width modals
- Touch-optimized

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate
- ESC to close modals
- Focus visible indicators

### Screen Readers
- Semantic HTML
- ARIA labels where needed
- Descriptive button text
- Status announcements

### Visual
- High contrast ratios
- Clear focus states
- Icon + text labels
- Sufficient touch targets

## Animation & Transitions

### Subtle Animations
- Modal enter/exit
- Button hover states
- Theme transitions
- Selection feedback

### Performance
- CSS transforms for smooth animations
- No layout thrashing
- Optimized re-renders
- Smooth scrolling

## UX Patterns

### Progressive Disclosure
- Start with essentials (template, config)
- Modals for complex choices
- Summary for overview
- Preview for final review

### Immediate Feedback
- Real-time stat updates
- Visual selection states
- Copy confirmation
- Hover effects

### Error Prevention
- Clear labels and placeholders
- Visual selection indicators
- Preview before download
- Reversible actions

### Efficiency
- One-click selections
- Bulk downloads
- Keyboard shortcuts
- No unnecessary steps

## Design Tokens

### Spacing
- **Gap**: 6 (1.5rem) between columns
- **Padding**: 4-8 for cards
- **Margin**: Consistent vertical rhythm

### Borders
- **Radius**: lg for cards, md for inputs
- **Width**: 1px default
- **Color**: Adaptive border color

### Shadows
- **Hover**: md shadow on cards
- **Modal**: lg shadow for elevation
- **None**: Default state

## Future Enhancements

### Potential Improvements
- Drag-and-drop module ordering
- Custom module creation
- Configuration presets/templates
- Keyboard shortcuts overlay
- Undo/redo functionality
- Export as project ZIP
- Import existing configs
- Shareable configuration URLs
