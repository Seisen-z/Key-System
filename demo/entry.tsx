import React from 'react';import {createRoot} from 'react-dom/client';import './native-mock.mjs';import '__APP_CSS__';
const {default:App}=await import('__APP_ENTRY__');
if(!location.hash)location.hash='/accounts';createRoot(document.getElementById('root')!).render(<App/>);
