import { createGlobalStyle } from 'styled-components'
import '@fontsource/inter/index.css'

export const GlobalStyles = createGlobalStyle`
  :root {
    color-scheme: dark;
    scroll-behavior: smooth;
    --font-family-base: 'Inter';
    --font-weight-regular: 400;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --font-size-2xs: 0.78rem;
    --font-size-xs: 0.82rem;
    --font-size-sm: 0.85rem;
    --font-size-sm-plus: 0.9rem;
    --font-size-md: 0.95rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.15rem;
    --font-size-lg-plus: 1.2rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.45rem;
    --font-size-code-sm: 0.8rem;
    --font-size-caption: 0.75rem;
    --font-size-fluid-body: clamp(1.08rem, 2.6vw, 1.35rem);
    --font-size-fluid-section-title: clamp(2.2rem, 5vw, 4.2rem);
    --font-size-fluid-hero-title: clamp(3.4rem, 10vw, 7rem);
    --font-size-fluid-hero-relay: clamp(2rem, 4vw, 3.1rem);
    --font-size-fluid-hero-meta: clamp(1rem, 2vw, 1.35rem);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    min-height: 100dvh;
  }

  body {
    margin: 0;
    font-family: var(--font-family-base);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #100d0b;
    color: #e6edf3;
    min-height: 100dvh;
  }

  #root {
    min-height: 100dvh;
  }

  button {
    font-family: inherit;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: inherit;
    font-weight: var(--font-weight-semibold);
  }

  a,
  button {
    -webkit-tap-highlight-color: transparent;
  }

  img {
    max-width: 100%;
    display: block;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`
