# Documentation Configuration

This file contains configuration for the documentation system of the Crawlee Scraper Toolkit.

## TypeDoc Configuration

The main configuration is in `typedoc.json`. Key features:

- **Markdown Output**: Primary documentation in Markdown format
- **HTML Output**: Interactive documentation for web viewing
- **JSON Output**: Machine-readable API documentation
- **Plugin System**: Enhanced with plugins for better documentation

## Documentation Structure

```
docs/
├── README.md                    # Main documentation index
├── EXAMPLES.md                  # Examples documentation
├── api/                         # API documentation (Markdown)
│   ├── README.md
│   ├── classes/
│   ├── interfaces/
│   └── modules/
├── html/                        # HTML documentation
│   ├── index.html
│   └── ...
├── coverage/                    # Test coverage reports
│   ├── lcov-report/
│   └── coverage-summary.json
└── api.json                     # JSON API documentation
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run docs` | Generate basic Markdown docs |
| `pnpm run docs:html` | Generate HTML documentation |
| `pnpm run docs:json` | Generate JSON API docs |
| `pnpm run docs:build` | Generate all documentation |
| `pnpm run docs:watch` | Watch mode for docs |
| `pnpm run docs:serve` | Serve docs locally |
| `pnpm run docs:clean` | Clean docs directory |
| `pnpm run docs:preview` | Build and serve docs |

## Custom Block Tags

The following JSDoc tags are supported:

- `@fileoverview` - File description
- `@version` - Version information
- `@author` - Author information
- `@license` - License information
- `@param` - Parameter description
- `@returns` - Return value description
- `@throws` - Exception description
- `@example` - Usage examples
- `@see` - References
- `@since` - Version introduced
- `@deprecated` - Deprecation notice

## CI/CD Integration

Documentation is automatically generated in CI/CD:

1. **Pull Requests**: Documentation is generated and artifacts are uploaded
2. **Main Branch**: Documentation is deployed to GitHub Pages
3. **Coverage Reports**: Included in documentation builds

## Local Development

### Quick Start
```bash
# Generate all docs
pnpm run docs:build

# Serve locally
pnpm run docs:serve
```

### Watch Mode
```bash
# Watch for changes and regenerate
pnpm run docs:watch
```

### Preview Mode
```bash
# Build and serve in one command
pnpm run docs:preview
```

## Configuration Files

- `typedoc.json` - Main TypeDoc configuration
- `.github/workflows/docs.yml` - CI/CD documentation workflow
- `scripts/docs.sh` - Documentation generation script

## Customization

To customize documentation:

1. **Modify `typedoc.json`** for TypeDoc settings
2. **Edit `scripts/docs.sh`** for build process
3. **Update templates** in the script for custom sections
4. **Add JSDoc comments** to source code for better docs

## Troubleshooting

### Common Issues

1. **Git Remote Warning**: Normal when not in a git repository
2. **Missing Dependencies**: Run `pnpm install` to install TypeDoc plugins
3. **Permission Errors**: Make sure `scripts/docs.sh` is executable

### Debug Mode

Enable debug mode for TypeDoc:
```bash
DEBUG=typedoc:* pnpm run docs
```
