# Design Specification

---

## Screen 1 — Hero Section + Navigation

### 1. Page / Section Identity
This is the **homepage** showing:
- The top navigation bar
- The hero section (two-column layout)
- The beginning of a "Selected work" section

---

### 2. Layout

#### Navigation Bar
- Full-width, single row, white/near-white background (`#F4F5F7` or `#F2F3F5`)
- Container: horizontally padded ~48px on each side (appears ~1280px max-width centered)
- Left: site name / logo text
- Right: three nav links spaced ~32px apart
- Height: ~56px; a thin 1px bottom border in `#E2E4E8`

#### Hero Section
- Two-column grid: **left ~55% width**, **right ~40% width**, ~5% gap
- Vertical padding top: ~80px, bottom: ~64px
- Left column stacks vertically: eyebrow tag → headline → body copy → CTA buttons
- Right column: profile card widget, vertically centered relative to the left column text

#### "Selected Work" Label Row
- Full-width row below hero, separated by a thin 1px rule in `#E2E4E8`
- Left: section heading; Right: metadata text (`05 projects · tap to open`)

---

### 3. Visual Style

#### Color Palette
| Role | Hex |
|---|---|
| Page background | `#F2F3F6` (very light cool gray) |
| Nav / card background | `#FFFFFF` |
| Primary text (heading) | `#0F1623` (near-black navy) |
| Body text | `#3D4452` (dark gray) |
| Eyebrow accent | `#2563EB` (blue) |
| Company link (Revalve) | `#2563EB` |
| Button primary bg | `#0F1623` (near-black) |
| Button primary text | `#FFFFFF` |
| Button secondary bg | `#FFFFFF` |
| Button secondary text | `#0F1623` |
| Button secondary border | `#D1D5DB` |
| Muted / meta text | `#8A92A0` |
| Timeline dot active | `#2563EB` |
| Profile circle border | `#D1D5DB` dashed |

#### Typography
| Element | Family | Weight | Size (approx) |
|---|---|---|---|
| Nav logo "Sam Carter" | Serif (appears Georgia or similar) | 400 | 17px |
| Nav links | Sans-serif (Inter or similar) | 400 | 14px |
| Eyebrow label | Sans-serif | 600 | 11px, letter-spacing ~0.12em, uppercase |
| Hero headline | Serif (e.g., Playfair Display or similar high-contrast serif) | 700 | ~52px line-height ~1.1 |
| Hero italic word "Revalve" | Same serif, italic | 400–500 | matches headline size |
| Hero body copy | Sans-serif | 400 | 16px, line-height ~1.6 |
| CTA button text | Sans-serif | 600 | 14px |
| Profile name | Sans-serif | 500 | 16px |
| Profile subtitle | Sans-serif | 400 | 13px, color muted |
| Resume section label | Sans-serif | 600 | 11px uppercase, letter-spacing 0.1em |
| Timeline dates | Sans-serif | 600 | 11px uppercase |
| Timeline title | Sans-serif | 600 | 14px |
| Timeline body | Sans-serif | 400 | 13px |
| "Selected work" heading | Serif | 600 | 28px |
| Section meta text | Sans-serif | 400 | 13px, muted color |

#### Borders, Radius, Shadows
- Nav bottom border: 1px solid `#E2E4E8`
- Profile card: `border-radius: 12px`, `box-shadow: 0 2px 12px rgba(0,0,0,0.07)`
- Profile photo circle: dashed border `2px dashed #C8CDD7`, `border-radius: 50%`, diameter ~120px
- CTA primary button: `border-radius: 6px`, no border
- CTA secondary button: `border-radius: 6px`, `border: 1px solid #D1D5DB`
- Section divider: `1px solid #E2E4E8`

---

### 4. Components Visible

#### NavBar
- Props: `logo` (string), `links: [{label, href}]`
- State: active link highlighted (no visible active style shown yet)
- Sticky at top

#### EyebrowTag
- Props: `labels: string[]` (joined with ` · `)
- Style: uppercase, letter-spaced, blue `#2563EB`, font-size 11px

#### HeroHeadline
- Rich text with an italic span for company name
- `<h1>` with embedded `<em>` for "Revalve"

#### HeroBody
- `<p>` paragraph, sans-serif, ~16px, muted dark gray

#### CTAButtonGroup
- Two buttons side-by-side, gap ~12px
- **Primary**: filled black, white text, "View work"
- **Secondary**: outlined, "Get in touch"
- Button padding: ~12px 24px

#### ProfileCard (right column widget)
- White card with rounded corners and subtle shadow
- Sections stacked top-to-bottom:
  1. Profile photo upload circle (dashed border, icon + "profile photo" label + "or browse files" link in blue)
  2. Name: `Sam Carter` — medium weight, ~16px
  3. Location · Role: `San Francisco · AI Engineer` — muted, 13px
  4. Horizontal divider
  5. "RÉSUMÉ" label (uppercase, 11px) + "drag → →" hint (muted, right-aligned)
  6. Horizontal timeline slider (scrollable, drag hint)
  7. Timeline cards (two partially visible): each has date range, job title, company (link in blue), description

#### TimelineSlider
- Horizontal scrolling carousel
- Progress bar at top with a single blue circular dot indicating position
- Cards partially visible to indicate scrollability
- Props: `entries: [{dateRange, title, company, companyUrl, description}]`

#### SectionHeader (Selected Work row)
- Props: `title` (string, serif), `meta` (string, muted right-aligned)
- Full-width, bottom border 1px `#E2E4E8`

---

### 5. Interactions Implied
- **Nav links**: hover → subtle underline or color change to `#2563EB`
- **"View work" button**: hover → slight background lighten (e.g., `#1E2A3A`)
- **"Get in touch" button**: hover → background `#F3F4F6`
- **Profile photo circle**: hover → border color darkens, cursor changes to pointer (upload trigger)
- **"browse files"**: clickable link
- **Timeline**: horizontal drag/scroll via mouse or touch; "drag → →" hint indicates this
- **"Selected work" section**: "tap to open" suggests project cards expand into modals

---

---

## Component Inventory

| # | Component Name | Description |
|---|---|---|
| 1 | `NavBar` | Fixed top bar with logo + nav links |
| 2 | `EyebrowTag` | Uppercase blue label row with dot separators |
| 3 | `HeroSection` | Two-column hero with text left, profile card right |
| 4 | `HeroHeadline` | Large serif `<h1>` with italic inline span |
| 5 | `HeroBody` | Paragraph body copy |
| 6 | `CTAButtonGroup` | Primary + Secondary button pair |
| 7 | `Button` | Reusable button, variants: `primary` | `secondary` |
| 8 | `ProfileCard` | White card: photo upload + name + timeline |
| 9 | `ProfilePhotoUpload` | Dashed circle with icon + upload affordance |
| 10 | `TimelineSlider` | Horizontal drag-scrollable resume timeline |
| 11 | `TimelineCard` | Individual timeline entry card |
| 12 | `SectionHeader` | Full-width heading row with right-aligned meta text |
| 13 | `Divider` | 1px horizontal rule in `#E2E4E8` |
| 14 | `ProjectsGrid` | Grid of project cards (implied below fold) |
| 15 | `ProjectCard` | Individual project card with tap-to-open modal |
| 16 | `ProjectModal` | Full or large modal showing project details |
| 17 | `ResumePage` | Dedicated resume/CV page layout |
| 18 | `WritingPage` | Blog/writing list page |
| 19 | `WritingCard` | Individual article/post card |
| 20 | `Footer` | Site footer with links and contact |

---

## Tailwind Tokens

```js
// tailwind.config.js extend
colors: {
  brand: {
    bg:         '#F2F3F6',  // bg-brand-bg
    surface:    '#FFFFFF',  // bg-brand-surface
    navy:       '#0F1623',  // text-brand-navy  / bg-brand-navy
    bodyText:   '#3D4452',  // text-brand-bodyText
    muted:      '#8A92A0',  // text-brand-muted
    accent:     '#2563EB',  // text-brand-accent / border-brand-accent
    border:     '#E2E4E8',  // border-brand-border
    borderMid:  '#D1D5DB',  // border-brand-borderMid
    borderDash: '#C8CDD7',  // for dashed profile circle
  }
},
fontFamily: {
  serif: ['Playfair Display', 'Georgia', 'serif'],
  sans:  ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
},
fontSize: {
  'eyebrow': ['11px', { letterSpacing: '0.12em', lineHeight: '1' }],
  'hero':    ['52px', { lineHeight: '1.1' }],
  'body':    ['16px', { lineHeight: '1.6' }],
  'sm-body': ['14px', { lineHeight: '1.5' }],
  'xs-body': ['13px', { lineHeight: '1.5' }],
},
borderRadius: {
  card:   '12px',
  btn:    '6px',
  circle: '9999px',
},
boxShadow: {
  card: '0 2px 12px rgba(0, 0, 0, 0.07)',
},
```

**Key class mappings:**

| Token | Tailwind Class |
|---|---|
| Page bg | `bg-[#F2F3F6]` |
| White surface | `bg-white` |
| Primary text | `text-[#0F1623]` |
| Body text | `text-[#3D4452]` |
| Muted text | `text-[#8A92A0]` |
| Blue accent | `text-[#2563EB]` |
| Border default | `border-[#E2E4E8]` |
| Btn primary | `bg-[#0F1623] text-white rounded-[6px] px-6 py-3 font-semibold text-sm` |
| Btn secondary | `bg-white text-[#0F1623] border border-[#D1D5DB] rounded-[6px] px-6 py-3 font-semibold text-sm` |
| Eyebrow | `text-[#2563EB] uppercase tracking-[0.12em] text-[11px] font-semibold font-sans` |
| Card shadow | `shadow-[0_2px_12px_rgba(0,0,0,0.07)] rounded-[12px]` |

---

## Cross-cutting Rules

1. **Typography system**: Use `font-serif` (Playfair Display) exclusively for headings (`h1`–`h3`) and section titles. All body copy, UI labels, nav, buttons use `font-sans` (Inter).
2. **Color discipline**: Never use pure `#000000` or `#FFFFFF` for text on colored backgrounds — always use `#0F1623` (navy) for dark text and `#F2F3F6` for the page background.
3. **Spacing scale**: Use multiples of 4px (Tailwind default scale). Major section vertical gaps: `py-16` (64px) to `py-20` (80px).
4. **Accent color**: Blue `#2563EB` is used only for: eyebrow labels, hyperlinks within text, active timeline dots, and the "browse files" link. Never for buttons.
5. **Border treatment**: All section dividers are `1px solid #E2E4E8`. Card borders (where present) use `#D1D5DB`. Dashed upload zones use `#C8CDD7`.
6. **Button hover states**: Primary button darkens by ~10% (`#1E2A3A`). Secondary button background becomes `#F3F4F6`. All transitions use `transition-colors duration-150`.
7. **Container max-width**: `max-w-[1280px] mx-auto px-12` for all top-level section wrappers.
8. **Profile / modal cards**: Always `rounded-[12px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]`.
9. **Nav bar**: Always sticky top, `bg-white border-b border-[#E2E4E8] z-50`.
10. **Italic emphasis**: Company/product names in hero headlines use `<em>` (serif italic), not `<strong>`.
11. **Responsive breakpoints**: Primary layout is desktop-first ~1280px. At `md` (768px), the hero collapses to single column (profile card moves below text). At `sm` (640px), hero heading reduces to ~36px.
12. **Section meta labels** (e.g., "05 projects · tap to open"): Always right-aligned, `text-[#8A92A0] text-[13px] font-sans`.