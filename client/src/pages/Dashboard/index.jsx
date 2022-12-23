import { useState, useContext, useEffect } from 'react'
import { Outlet, useLocation, Navigate } from "react-router";
import { Link } from "react-router-dom";

import UserContext from 'context/User'

import ErrorBoundary from 'common/ErrorBoundary'
import Sidebar from './components/Sidebar.jsx'
import SettingsModal from './components/Settings.jsx'

import Styles from './_.module.sass'

import Logo from 'images/Logo.svg'

import axios from 'axios';

export default function Dashboard(){

    const location = useLocation()
    const [state, setState] = useState({
        showSettings: false
    })

    const [user, setUser] = useContext(UserContext)

    useEffect(() => {
        axios
            .post('auth/getAuth')
            .catch(console.log)
            .then(({ data:{ user=null }={} }={}) => {
                setUser(user)
            })
    }, [location, setUser])

    // Protect the route. Only authorized users can be in here!
    if (!(user && user.id)) {
        console.log("Redirecting user to / because no user was found!")
        return <Navigate to="/" replace={true} />
    }

    return (
        <div className={Styles.Dashboard + (state.showFriends ? " " + Styles.friendsActive : "")}>
            {
                state.showSettings
                ? <SettingsModal closeModal={() => setState({ ...state, showSettings: false })} />
                : <></>
            }
            <Sidebar getState={[state, setState]} />
            <div className={Styles.Application}>
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
            </div>
            <Link className={Styles.watermark} to="/">
                <img src={Logo} alt="NavarroTech" />
            </Link>
        </div>
    )
}