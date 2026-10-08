# Agent Skills Installation Guide

**Date:** 2026-01-15  
**Status:** Ready for Installation  
**Total Skills:** 11 recommended (Priority 1-3)

---

## 📋 Overview

This guide provides step-by-step instructions for installing the recommended agent skills for NextJob development. The skills will provide AI assistants with deep knowledge of your tech stack, patterns, and best practices.

**Expected Coverage:** ~90% of required capabilities  
**Installation Time:** 45-60 minutes  
**Skills Location:** `.agents/skills/` (canonical location)

---

## 🚀 Quick Start

### Option 1: Automated Installation (Recommended)

```bash
# Make the script executable
chmod +x install-skills.sh

# Run the installation script
./install-skills.sh
```

The script will:
- Install all 11 recommended skills
- Verify each installation
- Test the shadcn skill specifically
- Provide a summary report

### Option 2: Manual Installation

If you prefer to install skills one by one, follow the detailed instructions below.

---

## 📦 Installation Instructions

### Prerequisites

Before installing skills, ensure you have:
- ✅ Node.js 18+ installed
- ✅ npm or Bun package manager
- ✅ Project dependencies installed (`npm install` or `bun install`)
- ✅ Internet connection for downloading skills

### Step 1: Install Priority 1 Skills (Critical)

These skills are essential for current development:

```bash
# 1. Official shadcn/ui skill (MOST IMPORTANT)
npx skills add https://github.com/shadcn-ui/ui --skill shadcn

# 2. Next.js patterns (for planned migration)
npx skills add vercel-labs/skills --skill nextjs -y

# 3. Supabase integration (already in dependencies)
npx skills add supabase/skills --skill supabase -y

# 4. React testing patterns
npx skills add testing-library/skills --skill react -y
```

**Why these are critical:**
- **shadcn**: Comprehensive component knowledge for 60+ components
- **nextjs**: Prepares for Next.js migration
- **supabase**: Integration patterns for existing @supabase/supabase-js
- **testing-library**: Component and accessibility testing

### Step 2: Install Priority 2 Skills (Important)

These skills optimize your development workflow:

```bash
# 5. Drizzle ORM patterns
npx skills add drizzle-team/skills --skill drizzle -y

# 6. Turborepo management
npx skills add vercel/skills --skill turborepo -y

# 7. Tailwind CSS patterns
npx skills add tailwindlabs/skills --skill tailwind -y
```

**Why these are important:**
- **drizzle**: Advanced ORM patterns for your 20+ table schema
- **turborepo**: Monorepo task orchestration and caching
- **tailwind**: Utility patterns and theming for Tailwind v4

### Step 3: Install Priority 3 Skills (Useful)

These skills provide additional capabilities:

```bash
# 8. Radix UI primitives
npx skills add radix-ui/skills --skill primitives -y

# 9. Biome linting configuration
npx skills add biomejs/skills --skill biome -y

# 10. Vercel analytics
npx skills add vercel/skills --skill analytics -y

# 11. Vercel edge computing
npx skills add vercel/skills --skill edge -y
```

**Why these are useful:**
- **radix**: Accessible component patterns
- **biome**: Advanced linting and formatting
- **analytics**: Performance monitoring (T-48)
- **edge**: Edge caching patterns (T-61)

### Step 4: Optional - Migration Skill

Only install if you're planning to migrate from Radix UI to Base UI:

```bash
# Optional: Radix to Base UI migration
npx skills add https://github.com/shadcn-ui/ui --skill migrate-radix-to-base
```

**Note:** shadcn/ui recently migrated from Radix to Base UI. This skill helps with migration but is not required for new projects.

---

## 🔍 Verification

After installation, verify each skill:

```bash
# List installed skills
ls -la .agents/skills/

# Verify individual skills
npx skills verify shadcn
npx skills verify @vercel/nextjs
npx skills verify @supabase/supabase
npx skills verify @testing-library/react
npx skills verify @drizzle-orm/drizzle
npx skills verify @turbo-repo/turborepo
npx skills verify @tailwindcss/tailwind
npx skills verify @radix-ui/primitives
npx skills verify @biomejs/biome
npx skills verify @vercel/analytics
npx skills verify @vercel/edge
```

### Test shadcn Skill Specifically

```bash
# Get project info
npx shadcn@latest info

# Test adding a component (dry-run)
npx shadcn@latest add dialog --dry-run

# Test searching for components
npx shadcn@latest search --query "form"
```

---

## 📊 Expected Results

After successful installation, you should have:

```
.agents/skills/
├── shadcn/
│   ├── SKILL.md
│   ├── cli.md
│   └── registry.md
├── @vercel/
│   ├── nextjs/
│   ├── turborepo/
│   ├── analytics/
│   └── edge/
├── @supabase/
│   └── supabase/
├── @testing-library/
│   └── react/
├── @drizzle-orm/
│   └── drizzle/
├── @tailwindcss/
│   └── tailwind/
├── @radix-ui/
│   └── primitives/
└── @biomejs/
    └── biome/
```

**skills-lock.json** will be created with:
- All installed skills and their versions
- Installation timestamps
- Source repositories

---

## 🧪 Testing the Skills

### Test 1: shadcn Component Addition

Ask your AI assistant:
> "Add a login form with email and password fields using shadcn components"

Expected behavior:
- AI uses `npx shadcn@latest add` commands
- Generates correct component code
- Uses proper Radix/Base UI patterns
- Includes accessibility features

### Test 2: Database Query with Drizzle

Ask your AI assistant:
> "Create a Drizzle query to fetch all eligible jobs for a user"

Expected behavior:
- AI uses Drizzle ORM patterns
- Generates type-safe queries
- Includes proper relations and joins
- Handles tenant isolation

### Test 3: React Component Testing

Ask your AI assistant:
> "Write a test for the Button component using Testing Library"

Expected behavior:
- AI uses Testing Library patterns
- Generates accessible tests
- Includes proper assertions
- Tests user interactions

---

## 🎯 Using the Skills

### With Claude Code

The skills will automatically activate when:
- Working with shadcn/ui components
- Writing Drizzle queries
- Creating React tests
- Configuring Tailwind
- Setting up analytics

### With Other AI Assistants

Most AI assistants will:
1. Detect `.agents/skills/` directory
2. Load relevant SKILL.md files
3. Apply patterns and best practices
4. Generate correct code on first try

---

## 📝 Updating Skills

To update skills to latest versions:

```bash
# Update all skills
npx skills update

# Update specific skill
npx skills update shadcn

# Check for updates
npx skills check
```

---

## 🗑️ Uninstalling Skills

To remove a skill:

```bash
# Remove specific skill
npx skills remove shadcn

# Remove all skills
npx skills remove --all
```

---

## 🔧 Troubleshooting

### Issue: Skills not found after installation

**Solution:**
```bash
# Check if .agents directory exists
ls -la .agents/

# Create directory if missing
mkdir -p .agents/skills

# Reinstall skills
./install-skills.sh
```

### Issue: npx skills command not found

**Solution:**
```bash
# Install skills CLI globally
npm install -g @anthropic/skills-cli

# Or use npx each time
npx @anthropic/skills-cli add ...
```

### Issue: Skill verification fails

**Solution:**
```bash
# Check skill directory structure
ls -la .agents/skills/<skill-name>/

# Ensure SKILL.md exists
cat .agents/skills/<skill-name>/SKILL.md

# Reinstall the skill
npx skills remove <skill-name>
npx skills add <source> --skill <skill-name>
```

### Issue: AI assistant not using skills

**Solution:**
1. Ensure `.agents/skills/` is in project root
2. Check that SKILL.md files are present
3. Restart your AI assistant
4. Explicitly reference skills in prompts

---

## 📚 Additional Resources

### Official Documentation
- [Skills.sh](https://skills.sh/) - Skills registry and documentation
- [shadcn/ui Skills](https://ui.shadcn.com/docs/skills) - Official shadcn skill docs
- [Agent Skills Format](https://github.com/anthropics/agent-skills) - Skills specification

### Community Resources
- [Skills Hub](https://skills-hub.ai/) - Community skills directory
- [UI Skills](https://www.ui-skills.com/) - UI-specific skills
- [Skillselion](https://skillselion.com/) - Curated skills list

### Related Documentation
- [AGENTS.md](./AGENTS.md) - Agent instructions and rules
- [skills-lock.json](./skills-lock.json) - Installed skills manifest
- [install-skills.sh](./install-skills.sh) - Installation script

---

## ✅ Checklist

Before marking installation as complete:

- [ ] All 11 skills installed successfully
- [ ] All skills verified with `npx skills verify`
- [ ] shadcn skill tested with `npx shadcn@latest info`
- [ ] `.agents/skills/` directory created
- [ ] `skills-lock.json` file generated
- [ ] AGENTS.md updated with skills section
- [ ] AI assistant can use skills effectively
- [ ] No errors or warnings during installation

---

## 🎉 Success Criteria

Installation is successful when:

1. ✅ All 11 skills are installed in `.agents/skills/`
2. ✅ `skills-lock.json` contains all installed skills
3. ✅ Verification passes for all skills
4. ✅ AI assistant can generate correct shadcn component code
5. ✅ AI assistant can write Drizzle queries correctly
6. ✅ AI assistant can create React tests properly
7. ✅ No installation errors or warnings

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review skill documentation at [skills.sh](https://skills.sh/)
3. Check GitHub issues for the specific skill repository
4. Consult the NextJob team

---

**Last Updated:** 2026-01-15  
**Version:** 1.0.0  
**Status:** Ready for Installation
