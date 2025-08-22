import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import configureStore from './store';
import { ModalProvider } from './components/context/Modal';
import { restoreCSRF, csrfFetch } from './store/csrf';
import { restoreUser } from './store/session';

const store = configureStore();

restoreCSRF().then(() => {
  store.dispatch(restoreUser()).then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <Provider store={store}>
          <BrowserRouter>
            <ModalProvider>
              <App />
            </ModalProvider>
          </BrowserRouter>
        </Provider>
      </React.StrictMode>
    );
  });
});

// For testing in dev console
if (import.meta.env.MODE !== "production") {
  window.csrfFetch = csrfFetch;
  window.store = store;
}
