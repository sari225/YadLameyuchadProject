
import './App.css';
import AppRouts from './routs/appRouts';
import {BrowserRouter as Router} from 'react-router-dom'
function App() {
  return (
    <div className="App">
     <Router>
       <AppRouts/>
     </Router>
    </div>
  );
}

export default App;
