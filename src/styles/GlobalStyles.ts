import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'Share Tech Mono', monospace;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #0a1929;
    color: #e6edf3;
  }

  #root {
    min-height: 100vh;
  }

  button {
    font-family: 'Share Tech Mono', monospace;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(13, 35, 57, 0.95);
  }

  ::-webkit-scrollbar-thumb {
    background: #1c4c7c;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #58a6ff;
  }
`