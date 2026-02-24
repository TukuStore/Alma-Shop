---
description: Styling rules for AlmaStore web-store — always use inline hex styles for colors
---

# Styling Rules

## CRITICAL: Always Use Inline Hex Styles for Decorative Colors

This project uses **Tailwind CSS V4** with `@theme inline` in `globals.css`. This configuration **strips out ALL default Tailwind color classes** (e.g. `bg-amber-500`, `text-emerald-600`, `fill-yellow-400`, etc.) from the compiled output. Only colors explicitly registered in the `@theme inline {}` block are available.

### ❌ NEVER DO THIS
```tsx
<span className="bg-amber-500 text-white">Badge</span>
<Star className="fill-amber-500 text-amber-500" />
<span className="bg-emerald-100 text-emerald-700">Success</span>
```

### ✅ ALWAYS DO THIS
```tsx
<span style={{ backgroundColor: '#FFB13B', color: '#ffffff' }}>Badge</span>
<Star className="w-4 h-4" style={{ fill: '#FFB13B', color: '#FFB13B' }} />
<span style={{ backgroundColor: '#d1fae5', color: '#059669' }}>Success</span>
```

### Safe Tailwind Classes (registered in @theme inline)
These semantic classes ARE safe because they're registered in `globals.css`:
- `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-card`, `bg-muted`
- `text-primary`, `bg-primary`, `border-border`, `text-destructive`
- `bg-alma-primary`, `text-alma-warning`, `bg-alma-success`, `bg-alma-error`, `bg-alma-info`

### AlmaStore Brand Color Hex Reference
| Token            | Hex       | Usage                    |
|------------------|-----------|--------------------------|
| alma-primary     | `#FF6B57` | Buttons, links, accents  |
| alma-warning     | `#FFB13B` | Stars, badges, warnings  |
| alma-success     | `#00D79E` | Success states           |
| alma-error       | `#FF3E38` | Error, destructive       |
| alma-info        | `#0076F5` | Info badges              |
| primary-fg       | `#FFFFFF` | Text on primary bg       |

### Rule
Every time you change any visual/UI/CSS styling, you MUST use `style={{ }}` with hardcoded hex values for any color that is NOT in the "Safe Tailwind Classes" list above. This ensures 100% safe rendering regardless of Tailwind's compiler behavior.
