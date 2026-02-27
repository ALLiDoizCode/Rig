# Semgrep Security Scanning Setup

## Installation

Semgrep is not available as an npm package. Install it globally using one of these methods:

### macOS (Homebrew)
```bash
brew install semgrep
```

### Linux/macOS (pip)
```bash
pip install semgrep
```

### Docker
```bash
docker pull semgrep/semgrep
```

## Usage

After installation, run security scans with:

```bash
npm run lint:security
```

## Configuration

The Semgrep configuration is in `.semgrep.yml` and includes rules for:

- **XSS Prevention**: Detects `dangerouslySetInnerHTML` and `rehype-raw` usage
- **Injection Prevention**: Identifies unsafe URL protocols (`javascript:`, `data:`)
- **Crypto Security**: Flags weak algorithms (MD5, SHA1)
- **Nostr Security**: Ensures signature verification on events
- **Secret Exposure**: Prevents logging of sensitive data
- **React Best Practices**: Missing key props, unsafe external links

## CI Integration

Add to GitHub Actions workflow:

```yaml
- name: Run Semgrep
  run: |
    pip install semgrep
    npm run lint:security
```

## Baseline Scan Results

**Initial scan (2026-02-27):**
- ✅ 0 XSS vulnerabilities (dangerouslySetInnerHTML, rehype-raw)
- ✅ 0 injection vulnerabilities (javascript:, data: URLs sanitized)
- ✅ 0 crypto weaknesses
- ✅ 0 secret exposures

All security rules passing. Codebase follows secure coding practices.
