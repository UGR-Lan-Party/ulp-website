module.exports = {
  ci: {
    collect: {
      // Number of runs to do per URL
      numberOfRuns: 3,
      // Settings for collecting Lighthouse results
      settings: {
        preset: 'desktop',
        chromeFlags: ['--disable-gpu', '--no-sandbox', '--no-zygote'],
      },
      // You can add multiple URLs to test
      url: ['http://localhost:3000']
    },
    assert: {
      // Add assertions here to enforce score thresholds
      assertions: {
        'categories:performance': ['warn', {minScore: 0.9}],
        'categories:accessibility': ['warn', {minScore: 0.9}],
        'categories:best-practices': ['warn', {minScore: 0.9}],
        'categories:seo': ['warn', {minScore: 0.9}],
        'first-contentful-paint': ['warn', {maxNumericValue: 2000}],
        'interactive': ['warn', {maxNumericValue: 3500}],
        'largest-contentful-paint': ['warn', {maxNumericValue: 2500}],
      }
    },
    upload: {
      // Upload target for the results
      target: 'temporary-public-storage',
      // You can also use other targets like 'lhci' if you have a Lighthouse CI Server
    },
  },
};
