# Visual Regression Testing Guide

## Overview

Visual regression tests use Playwright's built-in screenshot comparison to detect unintended UI changes. Baseline screenshots are stored in `e2e/__screenshots__/` and compared against on each test run.

## Running Visual Tests

```bash
# Run all visual regression tests
npm run test:e2e -- visual-regression.spec.ts

# Run with Playwright UI for debugging
npm run test:e2e:ui -- visual-regression.spec.ts

# Run specific test
npm run test:e2e -- visual-regression.spec.ts -g "home page - loading state"
```

## Updating Baselines

When you intentionally change UI (design updates, new features), update baselines:

```bash
# Update all baseline screenshots
npm run test:e2e -- visual-regression.spec.ts --update-snapshots

# Update baselines for specific test
npm run test:e2e -- visual-regression.spec.ts -g "home page - loading state" --update-snapshots
```

**Important:** Always review baseline changes carefully before committing. Use `git diff` to inspect screenshot changes.

## Test Coverage

### Page States
- **Home Page:** Loading, empty, error, populated states
- **Responsive Layouts:** Mobile (375px), tablet (768px), desktop (1280px)

### Component Isolation
- Repository card (loading skeleton, populated)
- Header and footer components
- Error message and retry button

### Interactive States
- Hover states (repository cards)
- Focus states (buttons, interactive elements)

### Theme Consistency
- Color palette verification
- Spacing and typography checks

## Baseline Screenshots

Baseline screenshots are stored at:
```
e2e/__screenshots__/
  ├── visual-regression.spec.ts/
  │   ├── home-loading-desktop.png
  │   ├── home-empty-desktop.png
  │   ├── home-error-desktop.png
  │   ├── home-populated-desktop.png
  │   ├── home-loading-mobile.png
  │   ├── home-loading-tablet.png
  │   ├── repo-card-skeleton.png
  │   ├── repo-card-populated.png
  │   ├── header-desktop.png
  │   ├── footer-desktop.png
  │   ├── repo-card-hover.png
  │   ├── retry-button-focus.png
  │   ├── theme-primary-components.png
  │   └── theme-spacing-typography.png
```

**These baselines are committed to git** and serve as the source of truth for visual appearance.

## Configuration

Visual regression settings in `playwright.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.01,  // 1% pixel difference allowed
    threshold: 0.2,           // 20% color difference per pixel
    animations: 'disabled',   // Disable animations for consistency
  },
}
```

## Troubleshooting

### Test Failures

When a visual test fails:

1. **Review the diff report:**
   ```bash
   npm run test:e2e -- visual-regression.spec.ts
   # Open playwright-report/index.html to see visual diffs
   ```

2. **Determine if change is intentional:**
   - **Intentional:** Update baselines with `--update-snapshots`
   - **Unintentional:** Fix the CSS/component issue

3. **Common causes of failures:**
   - Font rendering differences (OS-specific)
   - Timing issues (animations not disabled)
   - Dynamic content (dates, random data) → use `mask` option
   - Browser version differences → pin Playwright version

### Flaky Tests

If tests are flaky:

1. **Increase wait times** for dynamic content
2. **Mask dynamic regions** using the `mask` option:
   ```typescript
   await expect(page).toHaveScreenshot('test.png', {
     mask: [page.locator('.dynamic-content')],
   })
   ```
3. **Disable animations** (already configured globally)
4. **Use `waitForLoadState('networkidle')`** for pages with async data

### Cross-Platform Differences

Visual tests can be platform-specific (fonts, rendering). Playwright stores screenshots in platform-specific folders:

```
e2e/__screenshots__/
  ├── darwin/       # macOS baselines
  ├── linux/        # Linux baselines
  └── win32/        # Windows baselines
```

Only commit baselines for the platform(s) used in CI.

## Best Practices

1. **Keep baselines up to date** - Review and update after intentional UI changes
2. **Mask dynamic content** - User IDs, timestamps, random data
3. **Test multiple viewports** - Mobile, tablet, desktop
4. **Isolate components** - Test components in isolation when possible
5. **Document changes** - Add comments in PRs when updating baselines
6. **Review diffs carefully** - Always inspect visual diffs before committing

## CI Integration

Visual tests are currently marked with `.skip` to avoid flakiness in CI. To enable:

1. Remove `.skip` from test definitions
2. Configure CI to run on a consistent platform (e.g., ubuntu-latest)
3. Ensure fonts and rendering engines are consistent
4. Consider using `percy.io` or similar service for cloud-based visual testing

## Additional Resources

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Best Practices for Visual Testing](https://playwright.dev/docs/best-practices#visual-comparisons)
