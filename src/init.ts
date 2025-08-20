import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Initialize React in the global scope
if (typeof window !== 'undefined') {
    // Log existing React instance if any
    if (window.React) {
        console.log('[Init] Existing React version:', window.React.version);
    }

    window.React = React;
    window.ReactDOM = ReactDOM;

    console.log('[Init] Set global React version:', React.version);
}
