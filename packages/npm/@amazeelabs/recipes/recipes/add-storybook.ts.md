# Add storybook UI and Tailwind

```typescript
// Check node version.
$$('node -v', {
  stdout: $$.minimalVersion('12'),
});

// Check yarn version.
$$('yarn -v', {
  stdout: $$.minimalVersion('1.0'),
});
```
