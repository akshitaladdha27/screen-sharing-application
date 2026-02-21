import { Routes, Route } from "react-router-dom";
import ScreenTest from "./pages/ScreenTest";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ScreenTest />} />
    </Routes>
  );
}

export default App;