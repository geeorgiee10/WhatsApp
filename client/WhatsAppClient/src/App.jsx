import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Chat } from './components/chat';
import { Landing } from './components/landing';
import { Error404 } from './components/Error404';
import './assets/App.css';

function App() {

  return (
    <>
      <BrowserRouter>
      
      <main>
        <Routes>
          <Route exact path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </main>
      
    </BrowserRouter>
    </>
  )
}

export default App
