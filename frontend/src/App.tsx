/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Copilot from './pages/Copilot';
import GraphBuilder from './pages/GraphBuilder';
import RCA from './pages/RCA';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="copilot" element={<Copilot />} />
          <Route path="graph" element={<GraphBuilder />} />
          <Route path="rca" element={<RCA />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
