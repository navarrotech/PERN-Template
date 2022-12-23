import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

// Router
import { Navigate, Routes, Route } from "react-router"
import { BrowserRouter } from "react-router-dom";

// Pages
// import Auth from "./pages/Auth.jsx"

// Wrapper
// import Dashboard from "./pages/Dashboard.jsx"

// Context
import { UserProvider } from "context/User.jsx"

// Stylesheet
import "./sass/index.sass"

import axios from 'axios'
import database from 'database/client.js';

import DatabaseTest from 'database/test.jsx'

// Default settings 
if(process.env.REACT_APP_API){
    axios.defaults.baseURL = process.env.REACT_APP_API
    axios.defaults.crossDomain = true
    axios.defaults.withCredentials = true
}
axios.defaults.responseType = "json"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <UserProvider>
            <BrowserRouter>
                <Routes>
                    {/* { Auth } */}
                    <Route path="/" element={<><h1 className="title is-size-1 has-text-centered has-text-primary py-6">Hello world!</h1><Test/></>}/>
                    {/* <Route path="/" element={<Dashboard />}>
                        <Route path="/dashboard" element={<h1 className="title is-size-1 has-text-centered has-text-primary py-6">Hello world!</h1>}/>
                    </Route> */}
                    <Route path="/db-test" element={<DatabaseTest />}/>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </UserProvider>
    </StrictMode>
);

function Test(){
    return <button className="button is-primary" type="button" onClick={() => {
        database.users.get({ where:{ id: 1 } }, function(v){
            console.log(v)
        })
    }}>
        <span>Button Click</span>
    </button> 
}