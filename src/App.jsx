
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './component/Login.jsx'; 
import Home from './component/Home.jsx';   
import EventDetail from './component/EventDetail.jsx';
import Account from './component/Account.jsx';
import Semester from './component/Semester.jsx';
import SemesterDetail from './component/SemesterDetail.jsx';
import Organization from './component/Organization.jsx';
import Tracuu from './component/Tracuu.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/quanly" element={<Login />} />
        <Route path="/quanly/home" element={<Home />} />
        <Route path="/quanly/home/events/:eventId" element={<EventDetail />} />
        <Route path="/quanly/account" element={<Account/>}/>
        <Route path="/quanly/semester" element={<Semester/>} />
        <Route path="/quanly/semester/:semesterId" element={<SemesterDetail />} />
        <Route path="/quanly/organization" element={<Organization />} />
        <Route path="/" element={<Tracuu />} />
      </Routes>
    </Router>
  );
}

export default App;
