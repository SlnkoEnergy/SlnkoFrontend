import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssVarsProvider } from '@mui/joy/styles';
// import { StyledEngineProvider } from '@mui/joy/styles';
import { BrowserRouter } from 'react-router-dom';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BrowserRouter> 
      <CssVarsProvider>

          <App />
          
        </CssVarsProvider>
      </BrowserRouter>
  </React.StrictMode>
);
