# DIRHAMLY — Design System & UI/UX Instructions

## Product Vision
Dirhamly is a premium desktop finance application focused on:
- Personal expense tracking.
- Income management.
- Financial clarity.
- Calm and modern user experience.

The UI must feel:
- Minimal.
- Professional.
- Premium.
- Fast.
- Focused.
- Data-centric.
- Elegant in dark mode.

The design language should combine:
- Linear.
- Raycast.
- Notion Calendar.
- Arc Browser.
- Modern fintech dashboards.

Avoid:
- Generic admin dashboards.
- Harsh gradients.
- Overcrowded layouts.
- Excessive borders.
- Flat boring cards.
- Bootstrap-like UI.

---

# Core Design Philosophy

## UI Principles

### 1. Spacious Layouts
Use generous spacing:
- Large padding.
- Comfortable margins.
- Breathing room between sections.
- Clear hierarchy.

Never make the UI feel cramped.

---

### 2. Glass + Soft Depth
Use:
- Soft translucent surfaces.
- Subtle blur.
- Low-opacity borders.
- Gentle shadows.
- Ambient glow.

Avoid:
- Heavy neumorphism.
- Strong shadows.
- Overly bright glass effects.

---

### 3. Financial Clarity
Financial information must be:
- Instantly readable.
- Visually prioritized.
- Color coded carefully.

Important metrics:
- Income → green.
- Expenses → red/orange.
- Savings → blue/cyan.
- Balance → purple.

---

### 4. Motion Design
Animations must be:
- Smooth.
- Short.
- Natural.

Preferred durations:
- 150ms → hover.
- 220ms → modal transitions.
- 300ms → page transitions.

Use:
- fade.
- scale.
- subtle slide.
- opacity transitions.

Avoid:
- bounce.
- elastic effects.
- exaggerated movement.

---

# Desktop Layout Rules

## Sidebar
The sidebar should:
- Be slim and elegant.
- Use translucent dark surfaces.
- Include soft active states.
- Use rounded-xl or rounded-2xl corners.

### Sidebar Structure
Top:
- App logo.
- Workspace/app title.

Middle:
- Dashboard.
- Transactions.
- Analytics.
- Budgets.
- Goals.
- Reports.
- Categories.
- Settings.

Bottom:
- User profile.
- Role.
- Settings shortcut.

### Sidebar Behavior
- Hover expands icon backgrounds softly.
- Active item uses subtle gradient or glow.
- Icons from `lucide-react`.

---

# Dashboard Layout

## Top Header
Contains:
- Greeting.
- Current date range.
- Filter controls.
- Quick actions.

Typography:
- Large bold heading.
- Small muted description.

Example:
- “Good morning, Abderrahman 👋”
- “Here’s what’s happening with your finances today.”

---

# Statistics Cards

## Card Design
Cards must:
- Have subtle gradients.
- Use glassmorphism lightly.
- Include icon.
- Include trend indicator.
- Include micro chart/sparkline.

### Cards:
1. Total Income
2. Total Expenses
3. Net Savings
4. Current Balance

### Card Style
- Rounded-2xl.
- Border with low opacity.
- Soft inner glow.
- Hover elevation.

### Typography
Main amount:
- Very large.
- Bold.
- High contrast.

Currency:
- Smaller muted text.

Trend:
- Small colored indicator.

---

# Charts

## Income vs Expense Chart
Use:
- Rounded bars.
- Smooth tooltip.
- Clean axes.
- Minimal grid lines.

Colors:
- Income → green.
- Expense → red.

### Chart Container
- Large card.
- Comfortable padding.
- Floating dropdown filter.

---

## Spending Categories
Preferred:
- Doughnut chart.

Include:
- Percentage.
- Category legend.
- Color mapping.
- Total expense center label.

---

# Transactions Table

## Table Design
Must feel modern:
- Minimal borders.
- Hover row highlight.
- Soft separators.

Columns:
- Date.
- Description.
- Category.
- Type.
- Amount.

### Amount Styling
- Positive → green.
- Negative → red.

### Category Tags
Use pill badges:
- Rounded-full.
- Soft background.
- Subtle border.

---

# Add Transaction Panel

## Panel Behavior
Desktop side drawer:
- Slides from right.
- Frosted background.
- Dimmed overlay.

Width:
- ~420px to 500px.

---

## Form Design

### Transaction Type Toggle
Use segmented control:
- Income.
- Expense.

Selected state:
- Colored background.
- Smooth animation.

---

### Inputs
Inputs must:
- Be large.
- Rounded-xl.
- High readability.
- Dark surfaces.

Use:
- subtle borders.
- focus ring glow.
- placeholder opacity.

---

### Upload Area
Receipt upload:
- Dashed border.
- Icon centered.
- Hover highlight.

---

### Buttons

Primary:
- Gradient blue.
- Strong contrast.
- Hover glow.

Secondary:
- Transparent dark surface.
- Thin border.

Danger:
- Red tinted surface.

---

# Typography

## Font Style
Use:
- Inter.
- Geist.
- SF Pro Display style.

Hierarchy:
- Headings → bold.
- Labels → medium.
- Muted descriptions → low opacity.

Never use:
- Decorative fonts.
- Overly condensed fonts.

---

# Color System

## Base Background
Primary background:
- Near black.
- Slight blue tint.

Example:
- `#07090D`
- `#0B1020`

---

## Surface Colors
Cards:
- Semi transparent.
- Slight blue/gray tint.

Examples:
- `rgba(255,255,255,0.03)`
- `rgba(20,24,35,0.75)`

---

## Accent Colors

### Blue
Primary accent:
- `#4F7CFF`

### Green
Income:
- `#22C55E`

### Red
Expense:
- `#EF4444`

### Purple
Balance:
- `#8B5CF6`

### Orange
Warnings:
- `#F59E0B`

---

# Tailwind Styling Rules

## Always Use
- `rounded-2xl`
- `backdrop-blur`
- `border-white/10`
- `bg-white/[0.03]`
- `transition-all`
- `duration-200`
- `shadow-[...]`
- `hover:bg-white/[0.05]`

---

## Avoid
- Hard borders.
- Pure black backgrounds.
- Tiny spacing.
- Excessive gradients.
- Overuse of bright colors.
- Flat surfaces.

---

# Component Guidelines

## Buttons
Must feel:
- Clickable.
- Soft.
- Premium.

Hover:
- Glow slightly.
- Brighten subtly.

---

## Dropdowns
Use:
- Rounded corners.
- Blur background.
- Animated open state.

---

## Tooltips
- Minimal.
- Floating.
- Dark translucent.

---

# Accessibility

Always ensure:
- Proper contrast.
- Readable text.
- Clear focus states.
- Keyboard accessibility.

---

# Responsive Behavior

Desktop-first app.

Breakpoints:
- Sidebar collapses on smaller widths.
- Charts stack vertically.
- Transaction drawer becomes fullscreen on mobile.

---

# UX Expectations

The app should feel:
- Calm.
- Intelligent.
- Premium.
- Modern.
- Effortless.

Users should instantly understand:
- Their balance.
- Their spending.
- Their financial health.

---

# Engineering Expectations

## React Components
- Keep components modular.
- Prefer reusable cards/components.
- Use composition patterns.

---

## Animations
Preferred:
- `framer-motion`.

---

## Charts
Preferred:
- `recharts`.

---

## Icons
Only use:
- `lucide-react`.

---

# Important UI Notes

## DO
- Use layered surfaces.
- Use subtle gradients.
- Prioritize readability.
- Maintain consistent spacing.
- Use smooth transitions.

## DON'T
- Make it look like a template.
- Over-design.
- Use random colors.
- Use heavy shadows.
- Use harsh borders.

---

# Design References

The UI aesthetic should resemble a combination of:
- Linear.
- Arc Browser.
- Vercel Dashboard.
- Raycast.
- Modern fintech SaaS products.

---

# Final Goal

Dirhamly should feel like:
“A beautifully crafted premium finance operating system for modern users.”
