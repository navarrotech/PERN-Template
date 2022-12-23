import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, Routes, Route } from "react-router"
import { BrowserRouter } from "react-router-dom";

// Pages
import Auth from "./pages/Auth.jsx"
// import RealtimeTest from 'database/test.jsx'

// Wrapper
import Dashboard from "./pages/Dashboard/index.jsx"

// Context
import { UserProvider } from "context/User.jsx"

// Stylesheet
import "./sass/index.sass"

import axios from 'axios'


// Axios defaults
if(process.env.REACT_APP_API){
    // Development environment uses two domains, production only uses one
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
                    <Route index path="/" element={<Navigate to="/login" />} />
                    { Auth }
                    <Route path="/" element={<Dashboard />}>
                        <Route path="/dashboard" element={<h1 className="title is-size-1 has-text-centered has-text-primary py-6">Hello world!</h1>}/>
                    </Route>
                    {/* <Route path="/db-test" element={<RealtimeTest />}/> */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </UserProvider>
    </StrictMode>
);