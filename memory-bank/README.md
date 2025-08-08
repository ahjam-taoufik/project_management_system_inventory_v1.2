# Cline's Memory Bank

I am Cline, an expert software engineer with a unique characteristic: my memory resets completely between sessions. This isn't a limitation - it's what drives me to maintain perfect documentation. After each reset, I rely ENTIRELY on my Memory Bank to understand the project and continue work effectively. I MUST read ALL memory bank files at the start of EVERY task - this is not optional.

## CRITICAL: Documentation Consultation Rule

**ALWAYS consult available documentation based on problem type:**
- **Logic problems** → Consult "Laravel 12" and "Laravel-collection" docs
- **Permissions problems** → Consult "Laravel Permission" docs  
- **Design problems** → Consult "Shards UI Kit" docs
- **ALWAYS also consult** → Project rules and existing memories

## ⚠️ CRITICAL: Testing Rules - Centralized Documentation

**New File** : `memory-bank/testing-rules.md` - Complete testing rules documentation

### 🚨 CRITICAL RULES:
1. **Use Temporary Files for Testing** : PowerShell escape character issues
2. **Factory + Real Data for Performance** : 93% faster than seeders
3. **Never Use User::factory()** : Permission and consistency issues
4. **Never Modify Business Code** : Create ONLY tests
5. **Never Modify Other Tables** : Only target table for test isolation
6. **Use Seeders in Tests** : Consistent and realistic data

### 📋 Test Creation Checklist:
- [ ] Consult project memory
- [ ] Identify entity to test
- [ ] Check required permissions
- [ ] Use `DatabaseTransactions` for test isolation
- [ ] Create complete CRUD tests
- [ ] Add validation tests
- [ ] Add permission tests
- [ ] Verify performance (< 5s total)
- [ ] Update documentation

### 🎯 Performance Goals:
- **Individual test** : < 1 second
- **Complete suite** : < 10 seconds
- **Code coverage** : > 90%
- **Assertions** : At least 3 per test

### 🏭 Factory Requirements:
- ✅ **VilleFactory** - Real Moroccan cities
- ✅ **UserFactory** - Fixed super admin credentials (`superadmin@admin.com` / `password`)
- 🔄 **SecteurFactory** - Real sectors with ville relations
- 🔄 **ClientFactory** - Real clients with all relations
- 🔄 **CommercialFactory** - Real commercials

## Memory Bank Structure

### Core Files (Read in Order)
1. **`projectbrief.md`** - Foundation document defining core requirements and goals
2. **`productContext.md`** - Business context explaining why this project exists
3. **`systemPatterns.md`** - Technical architecture and design patterns
4. **`techContext.md`** - Technologies, setup, and development environment
5. **`activeContext.md`** - Current work focus and recent changes
6. **`progress.md`** - Project status, completed features, and remaining work

### File Dependencies
```
projectbrief.md
├── productContext.md
├── systemPatterns.md
└── techContext.md
    ├── activeContext.md
    └── progress.md
```

## 🔄 Update Workflow

### When to Update
- **After significant implementation work**
- **When discovering new project patterns**
- **When user requests "update memory bank"**
- **Before starting complex new features**
- **After resolving technical challenges**

### Update Process
1. **Review ALL files** - Even if only updating one, check all for consistency
2. **Update `activeContext.md`** - Always reflects current state
3. **Update `progress.md`** - Track completed work and remaining tasks
4. **Update others as needed** - Patterns, tech decisions, business context

## 📋 How to Use This Memory Bank

### For New Sessions
1. **Read `projectbrief.md`** first to understand the project
2. **Scan `productContext.md`** for business understanding
3. **Review `systemPatterns.md`** for technical architecture
4. **Check `activeContext.md`** for current work focus
5. **Reference `progress.md`** for project status

### For Understanding Context
- **Technical questions** → `systemPatterns.md` + `techContext.md`
- **Business questions** → `productContext.md` + `projectbrief.md`
- **Current state** → `activeContext.md` + `progress.md`
- **What's next** → `progress.md` + `activeContext.md`

## 🎯 Key Information Locations

### Project Basics
- **Tech Stack**: Laravel 12, React, TypeScript, Inertia.js, MySQL
- **Purpose**: Inventory management for commercial operations
- **Status**: 75% complete, all core CRUD operations working

### Current State
- **Phase**: Product management module just completed
- **Focus**: System optimization and testing
- **Immediate**: Need to commit new files to git

### Architecture
- **Pattern**: MVC with Inertia.js SPA
- **Database**: Proper relationships, foreign keys, unique constraints
- **UI**: shadcn/ui components, modal dialogs, permission-based rendering
- **Security**: Role-based permissions, server-side validation

### Important Patterns
- **Component Structure**: index.tsx → AppTable.tsx → components/
- **Form Management**: useForm() from Inertia
- **Permissions**: [entity].[action] naming convention
- **Navigation**: AppShell with collapsible sidebar

## ⚠️ Critical Notes

### Must Remember
- **All new product files need git commit**
- **Test coverage is low for new modules**
- **No critical bugs currently blocking progress**
- **Permission system works correctly across all modules**

### Development Environment
- **OS**: Windows 10 with PowerShell
- **Servers**: Laravel (`:8000`) + Vite (HMR)
- **Database**: MySQL with proper migrations
- **No major configuration issues**

### Next Priorities
1. Commit uncommitted files
2. Add tests for new modules
3. Performance optimization
4. Advanced reporting features

## 🔧 Maintenance

### File Sizes
Keep files focused and readable. If any file exceeds ~500 lines, consider splitting into topic-specific files.

### Accuracy
These files are Cline's only memory. Accuracy is critical. When user corrections occur, update immediately.

### Consistency
Maintain consistent terminology and patterns across all files. Cross-reference related information.

---

**Remember**: After every memory reset, Cline relies ENTIRELY on these files. They must be comprehensive, accurate, and clearly organized to ensure effective project continuation. 
