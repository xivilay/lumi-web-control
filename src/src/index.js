import React from 'react';
import ReactDOM from 'react-dom/client';
import { hpe } from 'grommet-theme-hpe';
import { deepMerge } from "grommet/utils";
import { Grommet } from 'grommet';

import './styles/index.css';
import App from './App';

const customTheme = {
    global: {
        font: {
            family: "Segoe UI",
        },
    },
};

const theme = deepMerge(hpe, customTheme);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Grommet theme={theme} themeMode="dark" full>
            <App />
        </Grommet>
    </React.StrictMode>
);