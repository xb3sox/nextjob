# shadcn/ui Integration Plan for NextJob

**Date:** 2026-01-15  
**Status:** Planning Phase  
**Goal:** Modernize NextJob UI with shadcn/ui components, blocks, and custom registry

---

## Executive Summary

Based on comprehensive research of shadcn/ui ecosystem in 2026, this plan recommends integrating:

- **shadcn/ui** - Modern component library (copy-paste, not npm package)
- **shadcn blocks** - Pre-built page sections and layouts
- **shadcn registries** - Custom component distribution system

**Expected Benefits:**
- 🎨 Professional, accessible components out of the box
- ⚡ Faster development with pre-built blocks
- 🔄 Reusable component registry across projects
- 🎯 Consistent design system
- 📱 Built-in responsive design
- ♿ WCAG 2.1 AA compliance
- 🎨 Easy theming and customization

---

## What is shadcn/ui?

### Core Concept

shadcn/ui is **not** a traditional component library you install via npm. Instead, it's a collection of reusable components that you **copy and paste** into your project. This gives you:

- **Full ownership** - Components live in your codebase
- **Complete control** - Modify anything you want
- **No version conflicts** - No dependency hell
- **Zero runtime overhead** - No extra bundle size
- **TypeScript-first** - Full type safety

### Key Features (2026)

- **60+ components** - Button, Card, Dialog, Form, Table, etc.
- **Built on Radix UI** - Accessible, unstyled primitives
- **Tailwind CSS** - Utility-first styling
- **Dark mode** - Built-in theme support
- **CLI tool** - Easy installation and management
- **Registry system** - Share and distribute components
- **Blocks** - Pre-built page sections
- **Skills** - AI agent integration (new in v4)

---

## What are shadcn Blocks?

### Definition

**Blocks** are pre-built page sections and layouts that combine multiple shadcn/ui components. They're like "LEGO pieces" for building pages quickly.

### Examples

```
- Hero sections
- Pricing tables
- Testimonial carousels
- Feature grids
- FAQ sections
- Contact forms
- Dashboard layouts
- Navigation menus
- Footer sections
```

### Benefits

1. **Speed** - Build pages in minutes, not hours
2. **Consistency** - Professional design patterns
3. **Customizable** - Full control over styling
4. **Responsive** - Mobile-first design
5. **Accessible** - WCAG compliant

### Where to Find Blocks

1. **Official shadcn blocks** - https://ui.shadcn.com/blocks
2. **Shadcnblocks.com** - 2151+ community blocks
3. **Third-party libraries** - Various premium and free options

---

## What are shadcn Registries?

### Definition

A **registry** is a distribution system for sharing shadcn/ui components, blocks, hooks, and utilities. It allows you to:

- **Share components** across multiple projects
- **Distribute custom components** to your team
- **Version control** your component library
- **Install via CLI** - `npx shadcn@latest add @myorg/button`

### Types of Registries

1. **Public registries** - Open source, anyone can use
2. **Private registries** - Company/team internal
3. **GitHub registries** - Hosted on GitHub
4. **Self-hosted registries** - Your own server

### Key Features (2026)

- **Namespace support** - `@acme/button`, `@myorg/card`
- **Authentication** - Secure private registries
- **Dynamic search** - Find components quickly
- **MCP server** - AI agent integration
- **Version management** - Track component versions
- **Dependency resolution** - Auto-install dependencies

---

## Integration Plan for NextJob

### Phase 1: Setup shadcn/ui (Week 1)

#### Step 1.1: Initialize shadcn/ui

```bash
# Install shadcn CLI
npx shadcn@latest init

# Choose options:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - Dark mode: Yes
```

This creates:
- `components.json` - Configuration file
- `src/components/ui/` - Component directory
- `src/lib/utils.ts` - Utility functions
- Updated `tailwind.config.js` - Theme configuration

#### Step 1.2: Install Core Components

```bash
# Essential components for NextJob
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add form
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add skeleton
npx shadcn@latest add badge
npx shadcn@latest add separator
```

#### Step 1.3: Install Advanced Components

```bash
# Application-specific components
npx shadcn@latest add data-table
npx shadcn@latest add select
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add accordion
npx shadcn@latest add avatar
npx shadcn@latest add progress
npx shadcn@latest add tooltip
npx shadcn@latest add popover
npx shadcn@latest add command
```

#### Step 1.4: Migrate Existing Components

Replace custom components with shadcn/ui:

**Before:**
```tsx
// src/components/Loading.tsx
export function ButtonLoader() {
  return <Loader2 className="h-5 w-5 animate-spin" />
}
```

**After:**
```tsx
// Use shadcn/ui spinner
import { Spinner } from "@/components/ui/spinner"

export function ButtonLoader() {
  return <Spinner className="h-5 w-5" />
}
```

**Before:**
```tsx
// src/components/Skeleton.tsx
export function Skeleton() {
  return <div className="animate-pulse bg-slate-700/50 rounded" />
}
```

**After:**
```tsx
// Use shadcn/ui skeleton
import { Skeleton } from "@/components/ui/skeleton"

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
```

---

### Phase 2: Implement shadcn Blocks (Week 2)

#### Step 2.1: Landing Page Blocks

Replace custom landing page with shadcn blocks:

**Hero Section:**
```tsx
import { HeroSection } from "@/components/blocks/hero-section"

export function LandingPage() {
  return (
    <HeroSection
      title="Apply to jobs with proof, not promises."
      description="NextJob builds a verified career graph from your experience..."
      cta={{ label: "Start free", href: "/signup" }}
    />
  )
}
```

**Features Section:**
```tsx
import { FeaturesGrid } from "@/components/blocks/features-grid"

<FeaturesGrid
  title="Why choose NextJob?"
  features={[
    {
      icon: <ShieldCheck />,
      title: "Evidence-backed",
      description: "Every claim traces to verified proof."
    },
    // ... more features
  ]}
/>
```

**Pricing Section:**
```tsx
import { PricingTable } from "@/components/blocks/pricing-table"

<PricingTable
  plans={[
    {
      name: "Free",
      price: "$0",
      features: ["Career graph (limited)", "5 applications/month"],
      cta: { label: "Get started", href: "/signup" }
    },
    {
      name: "Pro",
      price: "$39",
      period: "/month",
      features: ["Unlimited applications", "Full matching & tailoring"],
      cta: { label: "Start free trial", href: "/signup" },
      highlighted: true
    }
  ]}
/>
```

**FAQ Section:**
```tsx
import { FAQ } from "@/components/blocks/faq"

<FAQ
  questions={[
    {
      question: "How is this different from other AI tools?",
      answer: "We only generate content from your verified experience..."
    },
    // ... more questions
  ]}
/>
```

#### Step 2.2: Dashboard Blocks

**Application Tracker:**
```tsx
import { DataTable } from "@/components/blocks/data-table"

<DataTable
  columns={applicationColumns}
  data={applications}
  filters={[
    { id: "status", options: ["draft", "submitted", "interview"] }
  ]}
/>
```

**Career Graph:**
```tsx
import { CardGrid } from "@/components/blocks/card-grid"

<CardGrid
  items={careerClaims.map(claim => ({
    title: claim.title,
    description: claim.content,
    badge: claim.verificationStatus,
    actions: [
      { label: "Edit", onClick: () => editClaim(claim.id) },
      { label: "Verify", onClick: () => verifyClaim(claim.id) }
    ]
  }))}
/>
```

#### Step 2.3: Form Blocks

**Application Form:**
```tsx
import { FormSection } from "@/components/blocks/form-section"

<FormSection
  title="Application Details"
  fields={[
    { name: "coverLetter", type: "textarea", label: "Cover Letter" },
    { name: "resume", type: "file", label: "Resume" },
    { name: "portfolio", type: "url", label: "Portfolio URL" }
  ]}
  onSubmit={handleSubmit}
/>
```

---

### Phase 3: Create Custom Registry (Week 3)

#### Step 3.1: Setup Registry Structure

```
nextjob/
├── registry/
│   ├── registry.json          # Registry catalog
│   ├── components/
│   │   ├── application-card/
│   │   │   ├── application-card.tsx
│   │   │   └── registry-item.json
│   │   ├── career-claim-card/
│   │   │   ├── career-claim-card.tsx
│   │   │   └── registry-item.json
│   │   └── eligibility-badge/
│   │       ├── eligibility-badge.tsx
│   │       └── registry-item.json
│   ├── blocks/
│   │   ├── application-tracker/
│   │   │   ├── application-tracker.tsx
│   │   │   └── registry-item.json
│   │   └── career-graph-view/
│   │       ├── career-graph-view.tsx
│   │       └── registry-item.json
│   └── hooks/
│       ├── use-applications/
│       │   ├── use-applications.ts
│       │   └── registry-item.json
│       └── use-career-graph/
│           ├── use-career-graph.ts
│           └── registry-item.json
```

#### Step 3.2: Create registry.json

```json
{
  "name": "nextjob-ui",
  "homepage": "https://nextjob.ai",
  "items": [
    {
      "name": "application-card",
      "type": "registry:component",
      "title": "Application Card",
      "description": "Card component for displaying job applications",
      "files": [
        {
          "path": "registry/components/application-card/application-card.tsx",
          "type": "component"
        }
      ],
      "registryDependencies": ["card", "badge", "button"],
      "dependencies": ["date-fns"]
    },
    {
      "name": "career-claim-card",
      "type": "registry:component",
      "title": "Career Claim Card",
      "description": "Card for displaying verified career claims",
      "files": [
        {
          "path": "registry/components/career-claim-card/career-claim-card.tsx",
          "type": "component"
        }
      ],
      "registryDependencies": ["card", "badge", "tooltip"],
      "dependencies": []
    },
    {
      "name": "application-tracker",
      "type": "registry:block",
      "title": "Application Tracker",
      "description": "Full application tracking dashboard",
      "files": [
        {
          "path": "registry/blocks/application-tracker/application-tracker.tsx",
          "type": "block"
        }
      ],
      "registryDependencies": ["data-table", "application-card", "badge"],
      "dependencies": ["@tanstack/react-table"]
    }
  ]
}
```

#### Step 3.3: Create Custom Components

**Application Card:**
```tsx
// registry/components/application-card/application-card.tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface ApplicationCardProps {
  application: {
    id: string
    company: string
    position: string
    status: "draft" | "submitted" | "interview" | "rejected" | "offered"
    appliedAt: Date
    matchScore?: number
  }
  onView: () => void
  onEdit: () => void
}

export function ApplicationCard({ application, onView, onEdit }: ApplicationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{application.position}</h3>
          <Badge variant={getStatusVariant(application.status)}>
            {application.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{application.company}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Applied</span>
            <span>{format(application.appliedAt, "MMM d, yyyy")}</span>
          </div>
          {application.matchScore && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Match Score</span>
              <span className="font-semibold">{application.matchScore}%</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" onClick={onView}>
          View
        </Button>
        {application.status === "draft" && (
          <Button size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function getStatusVariant(status: string) {
  const variants = {
    draft: "secondary",
    submitted: "default",
    interview: "success",
    rejected: "destructive",
    offered: "success"
  }
  return variants[status as keyof typeof variants] || "default"
}
```

#### Step 3.4: Serve Registry

**Option A: Static JSON (Simple)**

```bash
# Build registry
npx shadcn@latest build

# Files generated in public/r/
# - public/r/registry.json
# - public/r/application-card.json
# - public/r/career-claim-card.json
```

**Option B: Dynamic Routes (Next.js)**

```tsx
// app/r/registry.json/route.ts
import { loadRegistry } from "shadcn/registry"
import { NextResponse } from "next/server"

export async function GET() {
  const registry = await loadRegistry()
  return NextResponse.json(registry)
}

// app/r/[name].json/route.ts
import { loadRegistryItem } from "shadcn/registry"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const item = await loadRegistryItem(params.name)
  return NextResponse.json(item)
}
```

#### Step 3.5: Use Registry

```bash
# Add registry to project
npx shadcn@latest registry add https://nextjob.ai/r/{name}.json

# Install components from registry
npx shadcn@latest add @nextjob/application-card
npx shadcn@latest add @nextjob/career-claim-card
npx shadcn@latest add @nextjob/application-tracker
```

---

### Phase 4: Advanced Features (Week 4)

#### Step 4.1: GitHub Registry

Turn GitHub repo into a registry:

```json
// registry.json (at repo root)
{
  "name": "nextjob-ui",
  "homepage": "https://github.com/nextjob/ui",
  "items": [...]
}
```

Users can install directly from GitHub:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/nextjob/ui/main/registry/application-card.json
```

#### Step 4.2: Private Registry with Authentication

```tsx
// app/r/[name].json/route.ts
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  // Verify authentication
  const token = request.headers.get("authorization")
  if (!verifyToken(token)) {
    return new Response("Unauthorized", { status: 401 })
  }
  
  const item = await loadRegistryItem(params.name)
  return NextResponse.json(item)
}
```

#### Step 4.3: MCP Server for AI Agents

```json
// mcp.json
{
  "name": "nextjob-ui",
  "description": "NextJob UI component registry",
  "tools": [
    {
      "name": "list_components",
      "description": "List all available components"
    },
    {
      "name": "get_component",
      "description": "Get component code and documentation"
    },
    {
      "name": "install_component",
      "description": "Install a component into the project"
    }
  ]
}
```

---

## Component Migration Plan

### Current Components → shadcn/ui

| Current Component | shadcn/ui Replacement | Priority |
|------------------|----------------------|----------|
| `ButtonLoader` | `Spinner` | High |
| `LoadingButton` | `Button` + `Spinner` | High |
| `PageLoader` | `Spinner` (full page) | High |
| `InlineLoader` | `Spinner` + text | High |
| `ProgressBar` | `Progress` | High |
| `SuccessMessage` | `Alert` (success) | Medium |
| `ErrorMessage` | `Alert` (destructive) | Medium |
| `Skeleton` | `Skeleton` | High |
| `CardSkeleton` | `Skeleton` + `Card` | High |
| `HeroSkeleton` | `Skeleton` (custom) | Medium |
| `FormField` | `Form` + `Input` | High |
| `FormSuccess` | `Alert` (success) | Medium |
| `FormError` | `Alert` (destructive) | Medium |

### Migration Steps

1. **Install shadcn/ui component**
   ```bash
   npx shadcn@latest add spinner
   ```

2. **Update imports**
   ```tsx
   // Before
   import { ButtonLoader } from "@/components/Loading"
   
   // After
   import { Spinner } from "@/components/ui/spinner"
   ```

3. **Update usage**
   ```tsx
   // Before
   <ButtonLoader size="md" />
   
   // After
   <Spinner className="h-5 w-5" />
   ```

4. **Remove old component**
   ```bash
   # Delete src/components/Loading.tsx (if no longer used)
   ```

---

## Benefits for NextJob

### 1. Faster Development

**Before:**
- Custom component design: 2-4 hours per component
- Accessibility testing: 1-2 hours per component
- Responsive design: 1-2 hours per component
- **Total: 4-8 hours per component**

**After:**
- Install shadcn/ui component: 5 minutes
- Customize styling: 15-30 minutes
- **Total: 20-35 minutes per component**

**Time saved: ~90%**

### 2. Consistent Design

- **Unified design language** across all pages
- **Consistent spacing, colors, typography**
- **Professional look** without design skills
- **Easy theming** with CSS variables

### 3. Better Accessibility

- **WCAG 2.1 AA compliant** out of the box
- **Keyboard navigation** built-in
- **Screen reader support**
- **Focus management**
- **ARIA labels**

### 4. Easier Maintenance

- **No version conflicts** - components in your codebase
- **Easy updates** - just copy new version
- **Full control** - modify anything
- **No breaking changes** - you own the code

### 5. Team Collaboration

- **Shared registry** - reuse components across projects
- **Consistent patterns** - easier onboarding
- **Version control** - track component changes
- **Documentation** - auto-generated from code

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Day 1: Initialize shadcn/ui
- [ ] Day 2: Install core components (button, card, input, form)
- [ ] Day 3: Install advanced components (data-table, dialog, toast)
- [ ] Day 4: Migrate Loading components
- [ ] Day 5: Migrate Skeleton components

### Week 2: Blocks Integration
- [ ] Day 1: Implement hero section block
- [ ] Day 2: Implement features section block
- [ ] Day 3: Implement pricing table block
- [ ] Day 4: Implement FAQ block
- [ ] Day 5: Implement footer block

### Week 3: Custom Registry
- [ ] Day 1: Setup registry structure
- [ ] Day 2: Create application-card component
- [ ] Day 3: Create career-claim-card component
- [ ] Day 4: Create application-tracker block
- [ ] Day 5: Serve and test registry

### Week 4: Advanced Features
- [ ] Day 1: GitHub registry setup
- [ ] Day 2: Private registry with auth
- [ ] Day 3: MCP server for AI agents
- [ ] Day 4: Migrate remaining components
- [ ] Day 5: Documentation and testing

**Total Time:** 4 weeks (part-time)

---

## Risk Assessment

### Low Risk
- **shadcn/ui integration** - Well-documented, widely used
- **Component migration** - Gradual, can be done incrementally
- **Blocks usage** - Pre-built, tested components

### Medium Risk
- **Custom registry** - New concept, requires testing
- **Team adoption** - Need to train team on new patterns
- **Migration time** - May take longer than estimated

### Mitigation Strategies
1. **Start small** - Migrate one component at a time
2. **Test thoroughly** - Verify accessibility and functionality
3. **Keep backups** - Don't delete old components immediately
4. **Document everything** - Help team understand new patterns
5. **Gradual rollout** - Don't migrate everything at once

---

## Success Metrics

### Quantitative Metrics
- [ ] Development time reduced by 50%
- [ ] Component count: 20+ shadcn/ui components installed
- [ ] Block count: 10+ blocks implemented
- [ ] Registry items: 5+ custom components
- [ ] Bundle size: < 10% increase (components are copy-paste)

### Qualitative Metrics
- [ ] Consistent design across all pages
- [ ] Improved accessibility (WCAG 2.1 AA)
- [ ] Faster onboarding for new developers
- [ ] Easier maintenance and updates
- [ ] Better developer experience

---

## Next Steps

### Immediate Actions (This Week)
1. **Review this plan** - Get team feedback
2. **Initialize shadcn/ui** - Run `npx shadcn@latest init`
3. **Install core components** - Button, Card, Input, Form
4. **Test integration** - Verify everything works
5. **Start migration** - Replace one component (e.g., Loading)

### Short-term Actions (Next 2 Weeks)
6. **Migrate all components** - Replace custom with shadcn/ui
7. **Implement blocks** - Use pre-built page sections
8. **Test accessibility** - Verify WCAG compliance
9. **Update documentation** - Reflect new component library

### Medium-term Actions (Next Month)
10. **Create custom registry** - Share NextJob components
11. **Build application-specific blocks** - Tracker, Career Graph
12. **Setup GitHub registry** - Public component library
13. **Train team** - Ensure everyone comfortable with shadcn/ui

---

## Conclusion

Integrating shadcn/ui, blocks, and registries will:
- ✅ **Accelerate development** - 90% faster component implementation
- ✅ **Improve quality** - Professional, accessible components
- ✅ **Ensure consistency** - Unified design language
- ✅ **Enable reuse** - Custom registry for team
- ✅ **Reduce maintenance** - No version conflicts

The migration is low-risk, incremental, and reversible. Each step has been carefully planned based on 2026 best practices and community adoption.

**Recommendation:** Proceed with Phase 1 (shadcn/ui setup) immediately.

---

## References

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [shadcn/ui Registry Guide](https://ui.shadcn.com/docs/registry)
- [shadcn Blocks](https://ui.shadcn.com/blocks)
- [Shadcnblocks.com](https://www.shadcnblocks.com/)
- [Registry Template](https://github.com/shadcn-ui/registry-template)
- [shadcn/cli v4 Changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4)

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-15  
**Author:** Development Team  
**Review Status:** Pending Team Review
