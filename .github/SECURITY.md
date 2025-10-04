# Security Policy

## Known Vulnerabilities and Risk Assessment

### webpack-dev-server (Moderate Severity)

**Status**: ACCEPTED - Dev Dependency Only

**CVEs**:
- GHSA-9jgg-88mc-972h: Source code may be stolen when accessing malicious sites with non-Chromium browsers
- GHSA-4v9v-hfq4-rm2v: Source code may be stolen when accessing malicious sites

**Risk Assessment**:
- **Impact**: Low - These vulnerabilities only affect the development server
- **Scope**: Development environment only - NOT included in production builds
- **Mitigation**: 
  - webpack-dev-server is listed in devDependencies and is not bundled in the production build
  - The production deployment uses static files served from GitHub Pages
  - End users never interact with webpack-dev-server
  - Development team should avoid visiting untrusted websites while running `npm start`

**Resolution Status**: 
- Upgrading to a fixed version would require updating to react-scripts 6.x (breaking change)
- The risk is acceptable because:
  1. Only developers are exposed (not end users)
  2. The vulnerability requires specific conditions (visiting malicious sites while dev server is running)
  3. Production builds are unaffected
  4. The effort to migrate to react-scripts 6.x outweighs the low actual risk

### Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it by:
1. Opening a GitHub issue with the "security" label
2. Providing details about the vulnerability and potential impact
3. Suggesting a fix if possible

We will respond to security reports within 48 hours.

### Security Best Practices

1. **Dependencies**: Regularly run `npm audit` and review new vulnerabilities
2. **Production Builds**: Always use production builds for deployment (`npm run build`)
3. **Development**: Avoid visiting untrusted websites while the development server is running
4. **Updates**: Keep dependencies up to date when possible without breaking changes

### Deployment Security Checks

Our CI/CD pipeline includes:
- ✅ Automated security vulnerability scanning with `npm audit`
- ✅ Blocking deployment for HIGH or CRITICAL vulnerabilities
- ✅ Allowing deployment with documented moderate/low dev dependency vulnerabilities
- ✅ Running all tests before deployment
- ✅ Verifying build output before deployment
