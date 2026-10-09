import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Benchmark from './pages/Benchmark';
import AttackGraph from './pages/AttackGraph';
import Controls from './pages/Controls';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="benchmark" element={<Benchmark />} />
          <Route path="attack-graph" element={<AttackGraph />} />
          <Route path="controls" element={<Controls />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
