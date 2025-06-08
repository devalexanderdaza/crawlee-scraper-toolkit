# CI/CD Caching Strategy

This document outlines the caching strategy employed in the CI/CD pipeline (`.github/workflows/ci-cd.yml`) to optimize build times and resource usage.

## pnpm Store Caching

The pnpm store, which holds downloaded package dependencies, is cached to avoid re-downloading packages on every CI run.

-   **Configuration:**
    -   **Path:** The pnpm store path is dynamically determined at runtime using the command `pnpm store path --silent`. This ensures the correct path is cached, regardless of the environment.
    -   **Cache Key:** The primary cache key is `${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}`.
        -   `runner.os`: Ensures the cache is OS-specific (e.g., Linux).
        -   `hashFiles('**/pnpm-lock.yaml')`: This is crucial. The cache is invalidated and recreated whenever the `pnpm-lock.yaml` file changes, ensuring that the correct set of dependencies is always used.
    -   **Restore Keys:** A fallback restore key `${{ runner.os }}-pnpm-store-` is used. This allows the CI job to use a potentially older cache if an exact match for the `pnpm-lock.yaml` hash is not found, which can still be faster than downloading everything from scratch.

-   **Effectiveness:** This setup is highly effective because:
    -   It significantly speeds up the `pnpm install` step.
    -   It ensures dependency integrity by tying the cache to the lock file.

## Playwright Browser Caching

Playwright requires browsers (Chromium, Firefox, WebKit) to be installed for end-to-end testing. These browsers can be quite large, so caching them is beneficial.

-   **Configuration:**
    -   **Path:** The standard Playwright browser cache path `~/.cache/ms-playwright` is used.
    -   **Cache Key:** The primary cache key is `playwright-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}`.
        -   `runner.os`: Ensures the cache is OS-specific.
        -   `hashFiles('**/pnpm-lock.yaml')`: The browser cache is also tied to the `pnpm-lock.yaml` file. This assumes that Playwright version (and thus browser versions) are managed as part of the project's dependencies. If Playwright or its browser versions were updated independently of other dependencies, this key might lead to using an outdated browser cache. However, for most projects where Playwright is a dev dependency, this is a sensible default.
    -   **Restore Keys:** A fallback restore key `playwright-${{ runner.os }}-` is used.

-   **Workflow:**
    1.  The cache is restored (if available).
    2.  `pnpm dlx playwright install --with-deps` is run. This command is idempotent; it will only download and install browsers that are missing or not up-to-date in the cache.

-   **Effectiveness:** This setup is effective for:
    -   Reducing the time spent downloading Playwright browsers.
    -   Ensuring the correct browsers are available for tests.

## Conclusion

The current CI/CD caching configuration for both the pnpm store and Playwright browsers is considered optimal for the project's needs. The use of hash-based keys ensures cache relevance and integrity, while restore keys provide fallbacks. No immediate changes are deemed necessary.
