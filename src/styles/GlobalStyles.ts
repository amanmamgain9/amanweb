import { createGlobalStyle } from 'styled-components'
import './fonts.css'

export const GlobalStyles = createGlobalStyle`
  :root {
    color-scheme: dark;
    scroll-behavior: smooth;
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
    font-family: 'MisoText', 'Avenir Next', 'Segoe UI', sans-serif;
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
    font-weight: 600;
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
