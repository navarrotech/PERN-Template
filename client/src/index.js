import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

// Router
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom"

// Pages
import Auth from "./pages/Auth.jsx"

// Wrapper
import Dashboard from "./widget/Dashboard.jsx"

// Context
import { UserProvider } from "./context/User.jsx"

// Stylesheet
import "./index.sass"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <UserProvider>
            <BrowserRouter>
                <Routes>
                    { Auth }
                    <Route path="/" element={<Dashboard />}>
                        <Route path="/dashboard" element={<h1 className="title is-size-1 has-text-centered has-text-primary py-6">Hello world!</h1>}/>
                    </Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </UserProvider>
    </StrictMode>
);