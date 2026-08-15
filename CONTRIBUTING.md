# Contributing to Enver Frontend

Thank you for your interest in contributing to the Enver frontend! This document outlines the process for contributing to this project.

## Getting Started

1. **Fork the repository**: Go to GitHub and click the "Fork" button
2. **Clone your fork**: `git clone https://github.com/your-username/enver-frontend.git`
3. **Create your feature branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** following the guidelines below
5. **Test your changes**: Run `npm test` to execute the test suite
6. **Submit a Pull Request** to the `main` branch

## Code Standards

### TypeScript/React
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with TypeScript
- Use TypeScript for all new code
- Prefer functional components with hooks over class components
- Use async/await over promises where possible

### Accessibility
- Ensure all interactive elements are keyboard-navigable
- Use semantic HTML elements for proper screen reader support
- Ensure adequate color contrast (following the dark theme)
- Provide alt text for all images and icons

### UI/UX
- Follow the design specifications provided in the Figma file
- Maintain consistent styling across all pages
- Ensure responsive design works on mobile and desktop
- Use the provided shimmer loaders during data fetching states

### Testing
- Add unit tests for new components using React Testing Library
- Add integration tests for critical user flows
- Run existing tests before submitting: `npm test`
- Aim for >80% code coverage

### Accessibility Testing
- Test with screen readers (NVDA, VoiceOver)
- Ensure keyboard navigation works for all interactive elements
- Verify color contrast meets WCAG AA standards
- Test on mobile viewports

## Pull Request Process

1. **Describe your changes** clearly in the PR description
2. **Link related issues** (e.g., "Fixes #123")
3. **Update documentation** if needed
4. **Keep PRs focused** - one feature/fix per PR
5. **Wait for review** - address feedback promptly

### Code Review Checklist
- [ ] Security implications reviewed
- [ ] Accessibility checklist completed
- [ ] UI/UX guidelines followed
- [ ] Tests added for new functionality
- [ ] No breaking changes to existing components

## Security Considerations

### Frontend Security
- Sanitize all user inputs
- Validate all data coming from API
- Never store secrets in localStorage permanently
- Use secure HTTP-only cookies if applicable
- CSP headers should be configured on the backend

### Data Handling
- Environment data should only be fetched via authenticated API calls
- Member management should require proper token scopes
- View details modal should enforce proper authentication
- Settings changes should require re-authentication for sensitive actions

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you agree to uphold this code.

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Thank You

Thank you for helping make Enver Frontend better! 🎨