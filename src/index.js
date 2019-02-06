import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SVG from 'svg.js';
import './production_hall/ProductionHall';
import InitKeyboardEventHandlers from './util/keyboard';
import { store } from './configureStore';
import ControlPanel from './components/ControlPanel';
import { Provider } from 'react-redux';

SVG.on(document, 'DOMContentLoaded', () => {
    // console.log('initial state', store.getState());

    ReactDOM.render(
        <Provider store={store}>
            <ControlPanel />
        </Provider>,
        document.getElementById('ui')
    );
});

InitKeyboardEventHandlers();