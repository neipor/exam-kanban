import { HashRouter, Routes, Route } from 'react-router-dom';
import { ScheduleProvider } from './context/ScheduleContext';
import './i18n'; // Initialize i18n

// Pages
import WelcomePage from './pages/WelcomePage';
import TimelinePage from './pages/TimelinePage';
import ImportPage from './pages/ImportPage';
import ExamplePage from './pages/ExamplePage';

function App() {
  return (
    <ScheduleProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/example" element={<ExamplePage />} />
        </Routes>
      </HashRouter>
    </ScheduleProvider>
  );
}

export default App;
