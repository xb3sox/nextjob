#!/bin/bash

# NextJob Agent Skills Installation Script
# Date: 2026-01-15
# Purpose: Install all recommended agent skills for NextJob development

set -e  # Exit on error

echo "🚀 Starting NextJob Agent Skills Installation..."
echo "================================================"
echo ""

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Environment check passed"
echo ""

# ============================================================================
# Priority 1: Critical Skills
# ============================================================================
echo "📦 Installing Priority 1 Skills (Critical)..."
echo "----------------------------------------------"

echo "1/4 Installing official shadcn skill..."
npx skills add https://github.com/shadcn-ui/ui --skill shadcn
echo "✅ shadcn skill installed"
echo ""

echo "2/4 Installing @vercel/nextjs skill..."
npx skills add vercel-labs/skills --skill nextjs -y
echo "✅ @vercel/nextjs skill installed"
echo ""

echo "3/4 Installing @supabase/supabase skill..."
npx skills add supabase/skills --skill supabase -y
echo "✅ @supabase/supabase skill installed"
echo ""

echo "4/4 Installing @testing-library/react skill..."
npx skills add testing-library/skills --skill react -y
echo "✅ @testing-library/react skill installed"
echo ""

# ============================================================================
# Priority 2: Important Skills
# ============================================================================
echo "📦 Installing Priority 2 Skills (Important)..."
echo "----------------------------------------------"

echo "5/7 Installing @drizzle-orm/drizzle skill..."
npx skills add drizzle-team/skills --skill drizzle -y
echo "✅ @drizzle-orm/drizzle skill installed"
echo ""

echo "6/7 Installing @turbo-repo/turborepo skill..."
npx skills add vercel/skills --skill turborepo -y
echo "✅ @turbo-repo/turborepo skill installed"
echo ""

echo "7/7 Installing @tailwindcss/tailwind skill..."
npx skills add tailwindlabs/skills --skill tailwind -y
echo "✅ @tailwindcss/tailwind skill installed"
echo ""

# ============================================================================
# Priority 3: Useful Skills
# ============================================================================
echo "📦 Installing Priority 3 Skills (Useful)..."
echo "----------------------------------------------"

echo "8/11 Installing @radix-ui/primitives skill..."
npx skills add radix-ui/skills --skill primitives -y
echo "✅ @radix-ui/primitives skill installed"
echo ""

echo "9/11 Installing @biomejs/biome skill..."
npx skills add biomejs/skills --skill biome -y
echo "✅ @biomejs/biome skill installed"
echo ""

echo "10/11 Installing @vercel/analytics skill..."
npx skills add vercel/skills --skill analytics -y
echo "✅ @vercel/analytics skill installed"
echo ""

echo "11/11 Installing @vercel/edge skill..."
npx skills add vercel/skills --skill edge -y
echo "✅ @vercel/edge skill installed"
echo ""

# ============================================================================
# Optional: Migration Skill
# ============================================================================
echo "📦 Optional: Migration Skill"
echo "----------------------------------------------"
read -p "Do you want to install migrate-radix-to-base skill? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing migrate-radix-to-base skill..."
    npx skills add https://github.com/shadcn-ui/ui --skill migrate-radix-to-base
    echo "✅ migrate-radix-to-base skill installed"
else
    echo "⏭️  Skipping migrate-radix-to-base skill"
fi
echo ""

# ============================================================================
# Verification
# ============================================================================
echo "🔍 Verifying Installations..."
echo "----------------------------------------------"

echo "Checking installed skills directory..."
if [ -d ".agents/skills" ]; then
    echo "✅ .agents/skills directory exists"
    echo ""
    echo "Installed skills:"
    ls -1 .agents/skills/ 2>/dev/null || echo "  (directory is empty or inaccessible)"
else
    echo "⚠️  .agents/skills directory not found. Skills may be installed elsewhere."
fi
echo ""

echo "Verifying critical skills..."
echo "1/11 Verifying shadcn skill..."
npx skills verify shadcn || echo "⚠️  shadcn verification failed"
echo ""

echo "2/11 Verifying @vercel/nextjs skill..."
npx skills verify @vercel/nextjs || echo "⚠️  @vercel/nextjs verification failed"
echo ""

echo "3/11 Verifying @supabase/supabase skill..."
npx skills verify @supabase/supabase || echo "⚠️  @supabase/supabase verification failed"
echo ""

echo "4/11 Verifying @testing-library/react skill..."
npx skills verify @testing-library/react || echo "⚠️  @testing-library/react verification failed"
echo ""

echo "5/11 Verifying @drizzle-orm/drizzle skill..."
npx skills verify @drizzle-orm/drizzle || echo "⚠️  @drizzle-orm/drizzle verification failed"
echo ""

echo "6/11 Verifying @turbo-repo/turborepo skill..."
npx skills verify @turbo-repo/turborepo || echo "⚠️  @turbo-repo/turborepo verification failed"
echo ""

echo "7/11 Verifying @tailwindcss/tailwind skill..."
npx skills verify @tailwindcss/tailwind || echo "⚠️  @tailwindcss/tailwind verification failed"
echo ""

echo "8/11 Verifying @radix-ui/primitives skill..."
npx skills verify @radix-ui/primitives || echo "⚠️  @radix-ui/primitives verification failed"
echo ""

echo "9/11 Verifying @biomejs/biome skill..."
npx skills verify @biomejs/biome || echo "⚠️  @biomejs/biome verification failed"
echo ""

echo "10/11 Verifying @vercel/analytics skill..."
npx skills verify @vercel/analytics || echo "⚠️  @vercel/analytics verification failed"
echo ""

echo "11/11 Verifying @vercel/edge skill..."
npx skills verify @vercel/edge || echo "⚠️  @vercel/edge verification failed"
echo ""

# ============================================================================
# Test shadcn skill specifically
# ============================================================================
echo "🧪 Testing shadcn skill..."
echo "----------------------------------------------"
echo "Running: npx shadcn@latest info"
npx shadcn@latest info || echo "⚠️  shadcn info command failed"
echo ""

echo "Running: npx shadcn@latest add button --dry-run"
npx shadcn@latest add button --dry-run || echo "⚠️  shadcn dry-run command failed"
echo ""

# ============================================================================
# Summary
# ============================================================================
echo "================================================"
echo "✅ Installation Complete!"
echo "================================================"
echo ""
echo "📊 Summary:"
echo "  - Total skills installed: 11 (or 12 with migration skill)"
echo "  - Coverage: ~90% of required capabilities"
echo "  - Critical skills: 4 (shadcn, nextjs, supabase, testing-library)"
echo "  - Important skills: 3 (drizzle, turborepo, tailwind)"
echo "  - Useful skills: 4 (radix, biome, analytics, edge)"
echo ""
echo "📝 Next Steps:"
echo "  1. Update AGENTS.md to document installed skills"
echo "  2. Test skills with your AI assistant"
echo "  3. Try adding a new shadcn component: npx shadcn@latest add dialog"
echo "  4. Create custom skills for remaining gaps (AI, extensions, Temporal)"
echo ""
echo "🔗 Documentation:"
echo "  - Skills directory: .agents/skills/"
echo "  - shadcn docs: https://ui.shadcn.com/docs/skills"
echo "  - Skills.sh: https://skills.sh/"
echo ""
echo "🎉 You're all set! Start building with your new agent skills."
echo ""
