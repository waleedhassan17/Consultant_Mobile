// App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AppContainer from './components/AppContainer';
import { useNotificationManager } from './notifications/notificationManager';

const App: React.FC = () => {
  // Initialize notification management
  useNotificationManager();

  return (
    <Provider store={store}>
      <AppContainer />
    </Provider>
  );
};

export default App;