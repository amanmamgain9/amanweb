import { createGlobalStyle } from 'styled-components'
import './fonts.css'

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    scrollbar-width: none;  /* Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
    &::-webkit-scrollbar {  /* Chrome, Safari and Opera */
      display: none;
    }
  }

  html {
    height: 100dvh;
  }
  body {
    margin: 0;
    font-family: Verdana, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #0a1929;
    color: #e6edf3;
    height: 100dvh;
    }

  #root {
    min-height: 100dvh;
  }

  button {
    font-family: 'Miso';
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Miso', sans-serif;
    font-weight: bold;
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
