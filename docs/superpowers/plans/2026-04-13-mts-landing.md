# MTS Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Astro static landing page with Hero, Features, How It Works, and CTA sections.

**Architecture:** Astro static site with component-based structure. Dark theme matching the web app design tokens. Responsive layout (3-col desktop, 2-col tablet, 1-col mobile).

**Tech Stack:** Astro, TypeScript, CSS

---

## Task 1: Project Scaffolding

**Files:**
- Create: `landing/package.json`
- Create: `landing/astro.config.mjs`
- Create: `landing/tsconfig.json`
- Create: `landing/src/pages/index.astro` (placeholder)

- [ ] **Step 1: Create Astro project**

```bash
cd /home/user/projects/mts
npm create astro@latest landing -- --template minimal --typescript strict --no-install
```

- [ ] **Step 2: Install dependencies**

```bash
cd /home/user/projects/mts/landing
yarn install
```

- [ ] **Step 3: Create folder structure**

```bash
cd /home/user/projects/mts/landing
mkdir -p src/layouts src/components src/styles src/pages public/images
```

- [ ] **Step 4: Update astro.config.mjs**

```javascript
// landing/astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mts.app',
});
```

- [ ] **Step 5: Verify it runs**

Run: `cd /home/user/projects/mts/landing && yarn dev`
Expected: Astro dev server starts on http://localhost:4321

- [ ] **Step 6: Commit**

```bash
git add landing/
git commit -m "feat(landing): scaffold Astro project"
```

---

## Task 2: Global Styles

**Files:**
- Create: `landing/src/styles/global.css`

- [ ] **Step 1: Create global styles with design tokens**

```css
/* landing/src/styles/global.css */

/* Reset */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Design Tokens */
:root {
  --bg-primary: #0d0d1a;
  --bg-secondary: #1a1a2e;
  --bg-tertiary: #2a2a3e;
  --text-primary: #e0e0e0;
  --text-secondary: #888888;
  --accent: #90caf9;
  --action-primary: #2e7d32;
  --action-primary-hover: #388e3c;
  --border: #333333;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

/* Base */
html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--accent);
  text-decoration: none;
}

img {
  max-width: 100%;
  display: block;
}

/* Utility */
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Button */
.btn-primary {
  display: inline-block;
  background-color: var(--action-primary);
  color: #ffffff;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;
}

.btn-primary:hover {
  background-color: var(--action-primary-hover);
}

.btn-outline {
  display: inline-block;
  background-color: transparent;
  color: var(--text-primary);
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color 0.2s;
  text-decoration: none;
}

.btn-outline:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* Section spacing */
.section {
  padding: 80px 0;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
}

.section-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 48px;
}
```

- [ ] **Step 2: Commit**

```bash
git add landing/src/styles/global.css
git commit -m "feat(landing): add global styles with design tokens"
```

---

## Task 3: Layout Component

**Files:**
- Create: `landing/src/layouts/Layout.astro`

- [ ] **Step 1: Create Layout.astro**

```astro
---
// landing/src/layouts/Layout.astro
interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>

<style is:global>
  @import '../styles/global.css';
</style>
```

- [ ] **Step 2: Update index.astro to use Layout**

```astro
---
// landing/src/pages/index.astro
import Layout from '../layouts/Layout.astro';
---

<Layout
  title="MTS — Motorcycle Tracking System"
  description="Track engine hours, get maintenance alerts, and keep a complete service history for your enduro motorcycles."
>
  <p>Landing page coming soon</p>
</Layout>
```

- [ ] **Step 3: Verify it renders**

Run: `cd /home/user/projects/mts/landing && yarn dev`
Expected: Page renders at http://localhost:4321 with dark background and "Landing page coming soon" text

- [ ] **Step 4: Commit**

```bash
git add landing/src/layouts/ landing/src/pages/
git commit -m "feat(landing): add Layout component with meta tags"
```

---

## Task 4: Nav Component

**Files:**
- Create: `landing/src/components/Nav.astro`

- [ ] **Step 1: Create Nav.astro**

```astro
---
// landing/src/components/Nav.astro
interface Props {
  appUrl: string;
}

const { appUrl } = Astro.props;
---

<nav class="nav">
  <div class="nav-inner container">
    <a href="/" class="logo">MTS</a>
    <a href={appUrl} class="btn-outline">Open App →</a>
  </div>
</nav>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border);
  }

  .nav-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .logo {
    font-size: 20px;
    font-weight: 700;
    color: var(--accent);
    text-decoration: none;
  }
</style>
```

- [ ] **Step 2: Add Nav to index.astro**

```astro
---
// landing/src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
---

<Layout
  title="MTS — Motorcycle Tracking System"
  description="Track engine hours, get maintenance alerts, and keep a complete service history for your enduro motorcycles."
>
  <Nav appUrl="https://app.mts.com" />
  <main style="padding-top: 60px;">
    <p>Content coming soon</p>
  </main>
</Layout>
```

- [ ] **Step 3: Verify nav renders**

Run: `cd /home/user/projects/mts/landing && yarn dev`
Expected: Fixed nav bar at top with "MTS" logo and "Open App →" button

- [ ] **Step 4: Commit**

```bash
git add landing/src/components/Nav.astro landing/src/pages/index.astro
git commit -m "feat(landing): add Nav component with logo and app link"
```

---

## Task 5: Hero Component

**Files:**
- Create: `landing/src/components/Hero.astro`

- [ ] **Step 1: Create Hero.astro**

```astro
---
// landing/src/components/Hero.astro
---

<section class="hero">
  <div class="container hero-inner">
    <h1 class="hero-title">Never Miss a Maintenance Window</h1>
    <p class="hero-subtitle">
      Track engine hours, get alerts when service is due, and keep a complete
      maintenance history for all your enduro motorcycles.
    </p>
    <a href="https://app.mts.com" class="btn-primary">Get Started — Free</a>
    <div class="hero-screenshot">
      <div class="screenshot-placeholder">
        App screenshot — motorcycle detail with task dashboard
      </div>
    </div>
  </div>
</section>

<style>
  .hero {
    padding: 100px 0 80px;
    text-align: center;
    background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  }

  .hero-inner {
    max-width: 700px;
  }

  .hero-title {
    font-size: 42px;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 16px;
  }

  .hero-subtitle {
    font-size: 18px;
    color: var(--text-secondary);
    line-height: 1.7;
    max-width: 540px;
    margin: 0 auto 32px;
  }

  .hero-screenshot {
    margin-top: 48px;
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
  }

  .screenshot-placeholder {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 60px 24px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  @media (max-width: 768px) {
    .hero {
      padding: 60px 0 48px;
    }

    .hero-title {
      font-size: 28px;
    }

    .hero-subtitle {
      font-size: 16px;
    }
  }
</style>
```

- [ ] **Step 2: Add Hero to index.astro**

```astro
---
// landing/src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
---

<Layout
  title="MTS — Motorcycle Tracking System"
  description="Track engine hours, get maintenance alerts, and keep a complete service history for your enduro motorcycles."
>
  <Nav appUrl="https://app.mts.com" />
  <main style="padding-top: 60px;">
    <Hero />
  </main>
</Layout>
```

- [ ] **Step 3: Verify hero renders**

Run: `cd /home/user/projects/mts/landing && yarn dev`
Expected: Hero section with gradient background, headline, subtitle, CTA button, screenshot placeholder

- [ ] **Step 4: Commit**

```bash
git add landing/src/components/Hero.astro landing/src/pages/index.astro
git commit -m "feat(landing): add Hero section with headline and CTA"
```

---

## Task 6: Features Component

**Files:**
- Create: `landing/src/components/Features.astro`

- [ ] **Step 1: Create Features.astro**

```astro
---
// landing/src/components/Features.astro
const features = [
  {
    icon: '⏱',
    title: 'Hours-Based Tracking',
    description: 'Track maintenance by engine hours — the metric that actually matters for off-road bikes.',
  },
  {
    icon: '🔔',
    title: 'Smart Alerts',
    description: 'Get notified when oil changes, chain lube, filter cleanings and more are coming due.',
  },
  {
    icon: '📋',
    title: 'Full History',
    description: 'Log every service with notes and photos. Complete maintenance record for every bike.',
  },
  {
    icon: '🏍',
    title: 'Multi-Bike Garage',
    description: 'Manage maintenance for all your motorcycles in one place.',
  },
  {
    icon: '⚙️',
    title: 'Custom Tasks',
    description: '12 pre-configured enduro tasks plus add your own custom maintenance intervals.',
  },
  {
    icon: '📱',
    title: 'Responsive',
    description: 'Works on desktop, tablet, and mobile. Check your bike\'s status anywhere.',
  },
];
---

<section class="features section">
  <div class="container">
    <h2 class="section-title">Built for Enduro Riders</h2>
    <p class="section-subtitle">Everything you need to keep your bike in top shape</p>
    <div class="features-grid">
      {features.map((feature) => (
        <div class="feature-card">
          <div class="feature-icon">{feature.icon}</div>
          <h3 class="feature-title">{feature.title}</h3>
          <p class="feature-description">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .features {
    background-color: var(--bg-secondary);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .feature-card {
    background-color: var(--bg-primary);
    border-radius: 12px;
    padding: 28px;
    text-align: center;
  }

  .feature-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .feature-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .feature-description {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  @media (max-width: 1023px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 767px) {
    .features-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 2: Add Features to index.astro**

```astro
---
// landing/src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import Features from '../components/Features.astro';
---

<Layout
  title="MTS — Motorcycle Tracking System"
  description="Track engine hours, get maintenance alerts, and keep a complete service history for your enduro motorcycles."
>
  <Nav appUrl="https://app.mts.com" />
  <main style="padding-top: 60px;">
    <Hero />
    <Features />
  </main>
</Layout>
```

- [ ] **Step 3: Verify features grid renders**

Run: `cd /home/user/projects/mts/landing && yarn dev`
Expected: 6 feature cards in 3-column grid (2 on tablet, 1 on mobile)

- [ ] **Step 4: Commit**

```bash
git add landing/src/components/Features.astro landing/src/pages/index.astro
git commit -m "feat(landing): add Features section with 6 feature cards"
```

---

## Task 7: How It Works Component

**Files:**
- Create: `landing/src/components/HowItWorks.astro`

- [ ] **Step 1: Create HowItWorks.astro**

```astro
---
// landing/src/components/HowItWorks.astro
const steps = [
  {
    number: 1,
    title: 'Add Your Bike',
    description: 'Enter your motorcycle details and current hour meter reading.',
  },
  {
    number: 2,
    title: 'Log Your Hours',
    description: 'Update your engine hours after each ride. MTS tracks what\'s due.',
  },
  {
    number: 3,
    title: 'Stay on Top',
    description: 'Get alerts before maintenance is due. Mark tasks done with notes and photos.',
  },
];
---

<section class="how-it-works section">
  <div class="container">
    <h2 class="section-title">How It Works</h2>
    <div class="steps">
      {steps.map((step) => (
        <div class="step">
          <div class="step-number">{step.number}</div>
          <h3 class="step-title">{step.title}</h3>
          <p class="step-description">{step.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .how-it-works {
    background-color: var(--bg-primary);
  }

  .steps {
    display: flex;
    justify-content: center;
    gap: 48px;
    max-width: 800px;
    margin: 0 auto;
  }

  .step {
    flex: 1;
    text-align: center;
  }

  .step-number {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--action-primary);
    color: #ffffff;
    font-size: 20px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  .step-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .step-description {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  @media (max-width: 767px) {
    .steps {
      flex-direction: column;
      gap: 32px;
    }
  }
</style>
```

- [ ] **Step 2: Add HowItWorks to index.astro**

```astro
---
// landing/src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import Features from '../components/Features.astro';
import HowItWorks from '../components/HowItWorks.astro';
---

<Layout
  title="MTS — Motorcycle Tracking System"
  description="Track engine hours, get maintenance alerts, and keep a complete service history for your enduro motorcycles."
>
  <Nav appUrl="https://app.mts.com" />
  <main style="padding-top: 60px;">
    <Hero />
    <Features />
    <HowItWorks />
  </main>
</Layout>
```

- [ ] **Step 3: Verify steps render**

Run: `cd /home/user/projects/mts/landing && yarn dev`
Expected: 3 numbered steps in horizontal row (stacked on mobile)

- [ ] **Step 4: Commit**

```bash
git add landing/src/components/HowItWorks.astro landing/src/pages/index.astro
git commit -m "feat(landing): add How It Works section with 3 steps"
```

---

## Task 8: CTA Component

**Files:**
- Create: `landing/src/components/Cta.astro`

- [ ] **Step 1: Create Cta.astro**

```astro
---
// landing/src/components/Cta.astro
---

<section class="cta">
  <div class="container cta-inner">
    <h2 class="cta-title">Ready to Ride?</h2>
    <p class="cta-subtitle">Start tracking your motorcycle maintenance in seconds.</p>
    <a href="https://app.mts.com" class="btn-primary">Get Started — Free</a>
  </div>
</section>

<style>
  .cta {
    padding: 80px 0;
    text-align: center;
    background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  }

  .cta-title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .cta-subtitle {
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 28px;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add landing/src/components/Cta.astro
git commit -m "feat(landing): add CTA section"
```

---

## Task 9: Footer Component

**Files:**
- Create: `landing/src/components/Footer.astro`

- [ ] **Step 1: Create Footer.astro**

```astro
---
// landing/src/components/Footer.astro
const year = new Date().getFullYear();
---

<footer class="footer">
  <div class="container footer-inner">
    <p class="footer-text">MTS — Motorcycle Tracking System &copy; {year}</p>
  </div>
</footer>

<style>
  .footer {
    padding: 24px 0;
    border-top: 1px solid var(--border);
    background-color: var(--bg-primary);
  }

  .footer-inner {
    text-align: center;
  }

  .footer-text {
    font-size: 13px;
    color: var(--text-secondary);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add landing/src/components/Footer.astro
git commit -m "feat(landing): add Footer component"
```

---

## Task 10: Assemble Index Page

**Files:**
- Modify: `landing/src/pages/index.astro`

- [ ] **Step 1: Wire all components into index.astro**

```astro
---
// landing/src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import Features from '../components/Features.astro';
import HowItWorks from '../components/HowItWorks.astro';
import Cta from '../components/Cta.astro';
import Footer from '../components/Footer.astro';
---

<Layout
  title="MTS — Motorcycle Tracking System"
  description="Track engine hours, get maintenance alerts, and keep a complete service history for your enduro motorcycles."
>
  <Nav appUrl="https://app.mts.com" />
  <main style="padding-top: 60px;">
    <Hero />
    <Features />
    <HowItWorks />
    <Cta />
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 2: Verify full page renders**

Run: `cd /home/user/projects/mts/landing && yarn dev`
Expected: Full landing page with Nav → Hero → Features → How It Works → CTA → Footer

- [ ] **Step 3: Verify build**

Run: `cd /home/user/projects/mts/landing && yarn build`
Expected: Build succeeds, static files in `dist/`

- [ ] **Step 4: Commit**

```bash
git add landing/src/pages/index.astro
git commit -m "feat(landing): assemble full landing page"
```

---

## Task 11: Responsive Polish

**Files:**
- Modify: various component styles if needed

- [ ] **Step 1: Test desktop (≥1024px)**

Run: `cd /home/user/projects/mts/landing && yarn dev`
Open http://localhost:4321 at 1200px width.
Expected: Features 3 columns, How It Works horizontal, hero text large

- [ ] **Step 2: Test tablet (768-1023px)**

Resize browser to 800px width.
Expected: Features 2 columns, How It Works still horizontal, text sizes adjusted

- [ ] **Step 3: Test mobile (<768px)**

Resize browser to 375px width.
Expected: Features 1 column, How It Works stacked vertical, hero title smaller, full-width CTA

- [ ] **Step 4: Fix any issues found and commit**

```bash
git add -A landing/src/
git commit -m "fix(landing): responsive polish across breakpoints"
```
