# Design System

This document outlines the design system for the Ski School OS website.

## Color Palette

Our color palette is designed to be clean, modern, and accessible.

### Primary
- **Blue**: Used for primary actions, links, and navigation elements.
  - `primary-50`: #E6F7FF
  - `primary-100`: #B3E8FF
  - `primary-200`: #80D9FF
  - `primary-300`: #4DCAFF
  - `primary-400`: #1ABFFF
  - `primary-500`: #00A9E0 
  - `primary-600`: #008AC7
  - `primary-700`: #006A9A
  - `primary-800`: #004B6D
  - `primary-900`: #002D40

### Neutrals
- **Gray**: Used for text, backgrounds, and borders.
  - `gray-50`: #F7FAFC
  - `gray-100`: #EDF2F7
  - `gray-200`: #E2E8F0
  - `gray-300`: #CBD5E0
  - `gray-400`: #A0AEC0
  - `gray-500`: #718096
  - `gray-600`: #4A5568
  - `gray-700`: #2D3748
  - `gray-800`: #1A202C
  - `gray-900`: #171923

### Accent Colors
- **Green (Success)**: Used for success messages and confirmations.
  - `green-500`: #48BB78
- **Yellow (Warning)**: Used for warnings and alerts.
  - `yellow-500`: #F6E05E
- **Red (Error)**: Used for error messages and destructive actions.
  - `red-500`: #F56565

### Dark Mode Palette
- **Background**: `gray-900`
- **Foreground**: `gray-100`
- **Primary**: `primary-400`
- **Card/Surface**: `gray-800`

## Typography

We use a modern, readable sans-serif font. The typographic scale is designed to be flexible and maintain a clear visual hierarchy.

- **Font Family**: Inter (or a similar sans-serif font)
- **Base Font Size**: 16px

### Scale
- `xs`: 0.75rem (12px)
- `sm`: 0.875rem (14px)
- `base`: 1rem (16px)
- `lg`: 1.125rem (18px)
- `xl`: 1.25rem (20px)
- `2xl`: 1.5rem (24px)
- `3xl`: 1.875rem (30px)
- `4xl`: 2.25rem (36px)
- `5xl`: 3rem (48px)

### Weights
- `normal`: 400
- `medium`: 500
- `semibold`: 600
- `bold`: 700

## Spacing

We use a 4px base unit for spacing. All margins, paddings, and gaps should be multiples of this unit.

- `0`: 0px
- `1`: 4px
- `2`: 8px
- `3`: 12px
- `4`: 16px
- `5`: 20px
- `6`: 24px
- `8`: 32px
- `10`: 40px
- `12`: 48px
- `16`: 64px
- `20`: 80px
- `24`: 96px
- `32`: 128px

## Grid System

We use a flexible grid system to create consistent and responsive layouts.

- **Columns**: 12
- **Gutter**: 24px
- **Container Padding**: 16px on mobile, 24px on desktop

## Components

All components should be built with reusability, accessibility, and consistency in mind.

- **Buttons**: Variants for primary, secondary, and destructive actions. Sizes for small, medium, and large.
- **Forms**: Consistent styling for inputs, labels, and error messages.
- **Cards**: Flexible card component for displaying content.
- **Modals**: Accessible modal component for displaying important information.
- ... (more components to be defined)

## Iconography

We use a consistent set of icons to improve usability and visual appeal.

- **Library**: Heroicons (or a similar open-source library)
- **Size**: 24x24
- **Stroke**: 1.5px

## Dark Mode

Dark mode is supported across the entire application. All components and pages should be designed with dark mode in mind. We will use a `dark` class on the `html` element to toggle dark mode.
