import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import Side from './components/Side/Side';
import Screen from './components/Screen/Screen';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home/Home';

function App() {
  
  const [powerOn, setOn] = useState(false);

  function onClick() {
    setOn(true);
    console.log("clicked");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div>
            <div className="Phone">
              <Side direction={powerOn ? "Front" : "Sideways"} onClick={onClick} />
              <Screen direction={powerOn ? "Front" : "Sideways"} />
            </div>
          </div>
        } />
        <Route path="/Home" element={
          <Home />
        } />
      </Routes>
    </BrowserRouter>
      
    );
  }
  
  export default App;