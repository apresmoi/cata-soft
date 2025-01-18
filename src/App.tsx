import { HomeScreen, PatientScreen } from "./pages";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/patient/:id" element={<PatientScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
