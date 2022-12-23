import { useState, useEffect, useContext } from "react"
import { Navigate, Route, Link, useNavigate, useLocation } from "react-router-dom"

import PasswordStrengthBar from 'react-password-strength-bar';

// Icons + Images
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faEnvelope, faLock, faPlus, faUser } from "@fortawesome/free-solid-svg-icons"

import Logo from "images/Logo.svg"

import Toast from 'common/Toast'
import Loader from "common/Loader"

import UserContext from "context/User.jsx"

import axios from "axios"

export function AuthPanel({ ...props }) {

    // Router
    const navigate = useNavigate()
    const location = useLocation()

    // Context + User
    const [ user, setUser ] = useContext(UserContext)
    
    // State
    const [ emailExists, setEmailExists ] = useState(false)
    const [ state, setState ] = useState({
        mode:     props.mode ? props.mode : "login",
        name:     location && location.state ? location.state.name || '' : '',
        email:    location && location.state ? location.state.email || '' : '',
        password: location && location.state ? location.state.password || '' : '',
        resetSuccess: location && location.state ? location.state.resetSuccess || false : false,
        buttonLoading: false,
        message: ""
    })

    // Check if email already exists on new signup
    useEffect(() => {
        if(!state.email){ return }
        axios
            .post('/auth/emailExists', { email: state.email })
            .catch(console.log)
            .then(({ data:{ exists=false }={} }={}) => {
                setEmailExists(exists)
            })
    }, [state.email])

    function SignIn() {
        setState({ ...state, buttonLoading: true })

        const { name, email, password } = state

        axios
            .post('/auth/' + state.mode, { name, email, password })
            .catch(({ response:{ data:{ message="" }={} }={}, request:{ code=400 }={} }) => {
                if(message){
                    setState({ ...state, buttonLoading: false, message })
                }
                return Promise.reject(message)
            })
            .then(({ data }) => {
                if(!data || !data.user){ return }
                setUser(data.user)
                navigate('/dashboard', { replace: false })
            })
    }

    let isNextDisabled = true
    if (state.email && state.email.includes("@") && state.password.length >= 8 && (state.mode === 'login' || (state.name))) {
        isNextDisabled = false
    }
    if(state.mode === 'signup' && emailExists){
        isNextDisabled = true
    }

    // Redirect the user if they're already authorized!
    if(user && user.id){
        return <Navigate to="/dashboard" replace={false}/>
    }

    return (
        <>
            <div className="block has-text-centered">
                <h1 className="title">{state.mode === "login" ? "Login" : "Sign Up"}</h1>
                {state.mode === "login" ? (
                    <h2 className="subtitle">
                        Or{" "}
                        <span
                            className="has-text-primary is-clickable"
                            onClick={() => {
                                setState({ ...state, mode: "signup", message:'' })
                            }}
                        >
                            signup for free
                        </span>
                    </h2>
                ) : (
                    <h2 className="subtitle">
                        Or{" "}
                        <span
                            className="has-text-primary is-clickable"
                            onClick={() => {
                                setState({ ...state, mode: "login", message:'' })
                            }}
                        >
                            login now
                        </span>
                    </h2>
                )}
            </div>
            <div className="block">
                {state.mode === "signup" ? (
                    <div className="field">
                        <div className="control has-icons-left">
                            <input
                                autoFocus={state.mode === "signup"}
                                className="input"
                                type="text"
                                placeholder="Full Name"
                                autoComplete="name"
                                value={state.name}
                                onKeyDown={(e) => { if (e.key === "Enter") { SignIn() } }}
                                onChange={(e) => {
                                    setState({ ...state, name: e.target.value })
                                }}
                            />
                            <span className="icon is-left">
                                <FontAwesomeIcon icon={faUser} />
                            </span>
                        </div>
                    </div>
                ) : (
                    <></>
                )}
                <div className="field">
                    <div className="control has-icons-left">
                        <input
                            autoFocus={state.mode === "login"}
                            className="input"
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            value={state.email}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { SignIn() }
                            }}
                            onChange={(e) => {
                                setState({ ...state, email: e.target.value })
                            }}
                        />
                        <span className="icon is-left">
                            <FontAwesomeIcon icon={faEnvelope} />
                        </span>
                    </div>
                    { emailExists && state.mode === 'signup'
                        ? <p className="help is-danger">This email is already signed up!{ state.mode === 'signup' ? <> Did you mean to <span className="has-text-link is-clickable" onClick={() => { setState({ ...state, mode:'login' }) }}>login</span>?</> : <></> }</p>
                        : <></>
                    }
                </div>
                <div className="field">
                    <div className="control has-icons-left">
                        <input
                            className="input"
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={state.password}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { SignIn() }
                            }}
                            onChange={(e) => {
                                setState({ ...state, password: e.target.value })
                            }}
                        />
                        <span className="icon is-left">
                            <FontAwesomeIcon icon={faLock} />
                        </span>
                    </div>
                </div>
                { state.message
                    ? <div className="field">
                        <div className="notification is-danger">
                            { state.message }
                        </div>
                    </div>
                    : <></>
                }
                {state.mode === "login" ? (
                    <div className="field level also-mobile">
                        <p className="is-size-6">&nbsp;</p>
                        <Link to="/forgot" state={{ email:state.email }} className="is-size-6 has-text-primary">
                            Forgot Password?
                        </Link>
                    </div>
                ) : (
                    <></>
                )}
            </div>
            <div className="block buttons is-centered">
                <button onClick={() => SignIn()} disabled={isNextDisabled} type="button" className={"button is-primary is-fullwidth" + (state.buttonLoading ? " is-loading" : "")}>
                    {state.mode === "login" ? (
                        <>
                            <span>Login</span>
                            <span className="icon">
                                <FontAwesomeIcon icon={faArrowRight} />
                            </span>
                        </>
                    ) : (
                        <>
                            <span>Sign Up</span>
                            <span className="icon">
                                <FontAwesomeIcon icon={faPlus} />
                            </span>
                        </>
                    )}
                </button>
            </div>
            {
                state.resetSuccess
                ? <Toast message="Password successfully reset!" time={1000 * 10} color="success" />
                : <></>
            }
        </>
    )
}

export function Logout() {
    const [done, setDone] = useState(false)
    const [, setUser] = useContext(UserContext)

    useEffect(() => {
        axios
            .post('/auth/logout')
            .catch(console.log)
            .finally(() => {
                setUser(null)
                setDone(true)
            })
    }, [setUser])

    if (done) {
        return <Navigate to="/" />
    }

    return <Loader fullpage={true} />
}

export function AuthPage({ mode }) {
    return (
        <div className="hero is-halfheight">
            <div className="hero-body">
                <div className="container is-max-fullhd">
                    <div className="subcontainer is-mini">
                        <figure className="block image is-128x128 is-centered">
                            <img src={Logo} alt="" />
                        </figure>
                        <div className="block box">
                            <AuthPanel mode={mode} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function Forgot() {

    const location = useLocation()
    const [state, setState] = useState({
        email: (location && location.state && location.state.email) ? location.state.email : '',
        finished: false,
    })

    function submit() {
        const { email } = state
        axios
            .post('/auth/forgot', { email })
            .catch(console.log)
            .then(({ data=null }={}) => {
                setState({ ...state, finished:true })
            })
    }

    if (state.finished) {
        return (
            <div className="hero is-halfheight">
                <div className="hero-body">
                    <div className="container is-max-fullhd">
                        <div className="subcontainer is-mini">
                            <figure className="block image is-128x128 is-centered">
                                <img src={Logo} alt="" />
                            </figure>
                            <div className="block box has-text-centered">
                                <div className="block has-text-centered">
                                    <h1 className="title">Reset Email Sent</h1>
                                    <p className="is-size-6">If this email exists within our system, you will receive an email with instructions to reset your password.</p>
                                </div>
                                <div className="block buttons is-centered">
                                    <Link className="button is-primary" to="/login" state={{ email:state.email }}>
                                        <span>Back To Login</span>
                                        <span className="icon">
                                            <FontAwesomeIcon icon={faArrowRight}/>
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="hero is-halfheight">
            <div className="hero-body">
                <div className="container is-max-fullhd">
                    <div className="subcontainer is-mini">
                        <figure className="block image is-128x128 is-centered">
                            <img src={Logo} alt="" />
                        </figure>
                        <div className="block box">
                            <div className="block has-text-centered">
                                <h1 className="title">Forgot Password</h1>
                                <h2 className="subtitle is-size-6">Enter your email address to reset your password</h2>
                            </div>
                            <div className="block">
                                <div className="field">
                                    <div className="control has-icons-left">
                                        <input
                                            autoFocus
                                            className="input"
                                            type="email"
                                            placeholder="Email"
                                            autoComplete="email"
                                            value={state.email}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    submit()
                                                }
                                            }}
                                            onChange={(e) => {
                                                setState({ ...state, email: e.target.value })
                                            }}
                                        />
                                        <span className="icon is-left">
                                            <FontAwesomeIcon icon={faEnvelope}/>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="block buttons is-centered">
                                <button className="button is-primary is-fullwidth" disabled={!(state.email && state.email.includes("@"))} onClick={submit} type="button">
                                    <span>Send Reset Instructions</span>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={faEnvelope} />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function Reset() {

    const location = useLocation()
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [error,    setError] = useState('')

    function submit() {
        axios
            .post('/auth/reset', { password, search: location.search })
            .catch(({ response:{ status, data }={} }={}) => {
                console.error(data)
                if(status){
                    setError(status)
                }
                return null
            })
            .then((req) => {
                navigate("/login", { replace:false, state:{ resetSuccess:!!req } })
            })
    }

    const disabled = !(password && password.length >= 8)

    if(error){
        return <div className="hero is-halfheight">
            <div className="hero-body">
                <div className="container is-max-fullhd has-text-centered is-fullwidth">
                    <h1 className="title">This link has expired!</h1>
                    <h2 className="subtitle">To continue, please <Link to="/forgot">request a new reset link</Link>.</h2>
                </div>
            </div>
        </div>
    }

    return (
        <div className="hero is-halfheight">
            <div className="hero-body">
                <div className="container is-max-fullhd">
                    <div className="subcontainer is-mini">
                        <figure className="block image is-128x128 is-centered">
                            <img src={Logo} alt="" />
                        </figure>
                        <div className="block box">
                            <div className="block has-text-centered">
                                <h1 className="title">Reset Password</h1>
                                <h2 className="subtitle is-size-6">What would you like your new password to be?</h2>
                            </div>
                            <div className="block">
                                <div className="field">
                                    <div className="control has-icons-left">
                                        <input
                                            autoFocus
                                            className="input"
                                            type="password"
                                            placeholder="New Password"
                                            autoComplete="new-password"
                                            value={password}
                                            onKeyDown={(e) => { if (e.key === "Enter") { submit() } }}
                                            onChange={(e) => { setPassword(e.target.value) }}
                                        />
                                        <span className="icon is-left">
                                            <FontAwesomeIcon icon={faLock}/>
                                        </span>
                                    </div>
                                    <div className="mt-3">
                                        <PasswordStrengthBar password={password} />
                                    </div>
                                </div>
                            </div>
                            <div className="block buttons is-centered">
                                <button className="button is-primary is-fullwidth" disabled={disabled} onClick={submit} type="button">
                                    <span>Set New Password</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default (
    <>
        <Route index key="login"  path ="/login"        element={<AuthPage mode="login"  />} />
        <Route index key="signup" path ="/signup"       element={<AuthPage mode="signup" />} />
        <Route index key="forgot" path ="/forgot"       element={<Forgot />                } />
        <Route index key="forgot" path ="/forgot/reset" element={<Reset  />                } />
        <Route index key="logout" path ="/logout"       element={<Logout />                } />
    </>
)
