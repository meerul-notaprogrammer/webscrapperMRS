# ePerolehan Tender Management System

## 🎨 Design System
**Microsoft Fluent Design** - Professional, modern interface inspired by Microsoft Teams, Azure Portal, and Office 365.

## ✨ Features Implemented

### 📊 Dashboard (Main View)
- **Statistics Cards** - 4 animated cards showing Available, Accepted, On Hold, and Removed tenders
  - Fluent Design depth shadows
  - Animated entrance with stagger effect
  - Trend indicators (daily changes)
  - Hover elevation effects

- **Search & Filter Bar**
  - Full-text search across quotations, summaries, ministries, and tags
  - Category filtering with multi-select dropdown
  - Active filter pills with easy removal
  - Clear all filters option

- **Tab Navigation** - Fluent Pivot style tabs for:
  - Available Tenders
  - Accepted Tenders
  - On Hold Tenders
  - Removed Tenders

- **Tender Cards** - Microsoft Fluent card design
  - Urgent badge for tenders closing in < 7 days
  - Red left border for urgent items
  - Amount prominently displayed
  - Ministry, location, and deadline information
  - Auto-generated tags
  - Quick action buttons (Accept, Hold, Remove, View)
  - Hover elevation animation

### 📋 Tender Detail Sidebar
- Slides in from right (480px width on desktop)
- Full-screen on mobile
- Backdrop with blur effect
- Comprehensive tender information:
  - Full description with formatting
  - Important dates with countdown
  - Ministry contact information
  - Financial details
  - Categories and tags
  - Document attachments
  - Internal notes (editable)
  - Activity history
- Action buttons for status changes

### ⚙️ Settings Page
- **Active Categories** - Select which tender categories to monitor
- **Automated Scraping**
  - Schedule display (3 times daily)
  - Status indicator
  - Next/last scrape information
  - Manual scrape trigger

- **Email Notifications**
  - Urgent tenders alerts
  - Daily summary reports
  - Weekly analytics
  - Status change notifications

- **Tag Management** - Configure auto-tagging keywords
- **Appearance** - Light/Dark mode toggle

### 📊 Analytics Page
- **Tender Activity Chart** - Line chart showing 30-day activity
- **Status Distribution** - Donut chart with percentages
- **Category Performance** - Bar chart of most active categories
- **Financial Overview**
  - Total value tracked
  - Accepted tender values
  - Average and highest tender values
  - Value breakdown by category

- **Urgency Analysis**
  - Urgent (< 7 days)
  - Moderate (7-14 days)
  - Comfortable (> 14 days)
  - Visual progress bars

- Export and email report functionality

## 🎨 Design Highlights

### Color Palette
**Light Mode:**
- Primary Blue: #0078D4 (Microsoft Blue)
- Success Green: #107C10
- Warning Orange: #F7630C
- Danger Red: #D13438
- Background: #F3F2F1
- Card: #FFFFFF

**Dark Mode:**
- Primary Blue: #4CC2FF (Brighter)
- Success Green: #92C353
- Warning Orange: #FF8C00
- Danger Red: #F85149
- Background: #1B1A19
- Card: #292827

### Typography
- Font Family: Segoe UI (Microsoft), with fallbacks
- Headings: 24-32px, Weight 600-700
- Body: 14-16px, Weight 400-500
- Labels: 12-13px, Weight 500

### Shadows (Fluent Depth System)
- Depth 4: Cards at rest
- Depth 8: Cards on hover
- Depth 16: Modals/Sidebar

### Animations
- **Entrance**: Fade in + slide up with stagger (Statistics cards)
- **Hover**: Lift effect (translateY -2px) with shadow increase
- **Sidebar**: Smooth slide from right (300ms spring)
- **Status changes**: Toast notifications with success/error states
- **Scraping**: Loading spinner animation

## 🚀 Functionality

### State Management
- Tender status updates (Available → Accepted/Hold/Removed)
- Search and filter state
- Dark mode persistence
- Activity history tracking

### Data
- 8 mock tenders with realistic Malaysian government data
- Multiple categories (Perabot Pejabat, Bekalan Pejabat, CCTV, etc.)
- Full tender details including:
  - Quotation numbers
  - Categories with codes
  - Detailed descriptions in Bahasa Malaysia
  - Ministry information
  - Budget codes and payment terms
  - Document attachments
  - Tags and metadata

### User Experience
- **Responsive Design**
  - Desktop: 1440px max-width
  - Tablet: Adjusted layouts
  - Mobile: Full-screen modals, stacked cards

- **Accessibility**
  - Keyboard navigation
  - Focus states
  - ARIA labels
  - Color contrast (WCAG compliant)

- **Feedback**
  - Toast notifications for actions
  - Loading states
  - Empty states with helpful messages
  - Hover states

## 📱 Pages

1. **Dashboard** - Main tender monitoring interface
2. **Settings** - Configuration and preferences
3. **Analytics** - Data visualization and insights

## 🎯 Key Interactions

- **Scrape Tenders** - Manual refresh with loading animation
- **Search** - Real-time filtering
- **Filter by Category** - Multi-select with active pills
- **View Details** - Opens sidebar with full information
- **Change Status** - Accept/Hold/Remove with instant feedback
- **Toggle Dark Mode** - Smooth theme transition
- **Navigate Pages** - Settings and Analytics accessible via user menu

## 🌗 Dark Mode
Full support for dark theme:
- All components adapt colors
- Softer shadows
- Increased contrast
- Smooth transitions
- Toggle in header

## 📊 Mock Data Highlights
- 8 realistic Malaysian government tenders
- Categories: Office Furniture, Stationery, CCTV, Air Conditioning, Printing, Kitchen Equipment, Safety Equipment
- Ministries: Kementerian Kewangan, MOH, JKR, MOE, etc.
- Amount range: RM 12,500 - RM 95,000
- Mix of urgent and non-urgent tenders
- Different statuses represented

## 🎨 Component Architecture

```
App.tsx (Main)
├── Header
│   ├── Logo
│   ├── Last Scrape Time
│   ├── Refresh Button
│   ├── Dark Mode Toggle
│   └── User Menu
├── Statistics Cards (4)
├── Search & Filter Bar
├── Tabs Navigation
├── Tender Cards List
└── Tender Detail Sidebar

SettingsPage.tsx
├── Header with Back Button
├── Active Categories Section
├── Scraping Schedule Section
├── Email Notifications Section
├── Tag Management Section
├── Appearance Section
└── Action Buttons

AnalyticsPage.tsx
├── Header with Actions
├── Activity Line Chart
├── Status Pie Chart
├── Category Bar Chart
├── Financial Overview
└── Urgency Analysis
```

## 🛠️ Technology Stack

- **React** 18.3.1
- **TypeScript** (via JSX)
- **Tailwind CSS** 4.x (with custom theme)
- **Motion/React** (Framer Motion) - Animations
- **Recharts** - Charts and data visualization
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **Next Themes** - Dark mode support
- **Radix UI** - Accessible UI primitives

## 🎯 Design Principles Applied

1. **Microsoft Fluent Design Language**
   - Acrylic effects
   - Depth and elevation
   - Smooth animations
   - Professional aesthetics

2. **Data-Dense Interface**
   - Quick scanning
   - Information hierarchy
   - Action-oriented design

3. **Malaysian Government Context**
   - Professional tone
   - Bahasa Malaysia support
   - Local currency (RM)
   - Malaysian ministries

4. **Accessibility First**
   - Keyboard navigation
   - Screen reader support
   - High contrast
   - Clear focus states

## ✅ Completion Status

All Phase 1 (Core/MVP) features implemented:
- ✅ Main Dashboard
- ✅ Tender Card Component (all states)
- ✅ Detail Sidebar
- ✅ Statistics Cards
- ✅ Search & Filter Bar
- ✅ Settings Page
- ✅ Dark Mode
- ✅ Analytics Page
- ✅ Responsive Design
- ✅ Animations & Transitions

## 🎉 Ready to Use!

The ePerolehan Tender Management System is fully functional with:
- Beautiful Microsoft Fluent Design aesthetic
- Full dark mode support
- Comprehensive tender management
- Analytics and insights
- Settings and configuration
- Responsive across all devices
