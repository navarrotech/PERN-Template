import { useState, useEffect, useContext } from "react"
import { Navigate, Route, Link, useNavigate } from "react-router-dom"

// Icons + Images
import { FontAwesomeIcon as FontAwesome6 } from "@fortawesome/react-fontawesome"
import { faArrowRight, faEnvelope, faLock, faPlus } from "@fortawesome/free-solid-svg-icons"

import Logo from "images/logo.svg"

import Loader from "common/Loader"

import UserContext from "context/User.jsx"

import axios from "axios"

export function AuthPanel({ ...props }) {

    const navigate = useNavigate()
    const [ user, setUser ] = useContext(UserContext)
    const [ state, setState ] = useState({
        mode: props.mode ? props.mode : "login",
        name: "",
        email: "",
        password: "",
        buttonLoading: false,
        message: ""
    })

    useEffect(() => {
        if(user && user.uid){ navigate('/dashboard', { replace: false }) }
    }, [user, navigate])

    function SignIn() {
        setState({ ...state, buttonLoading: true })

        const { name, email, password } = state

        axios
            .post('/auth/' + state.mode, { name, email, password })
            .catch((error) => {
                if(error.message){
                    setState({ ...state, buttonLoading: false, message: error.message })
                }
                Promise.reject(error)
            })
            .then(({ data }) => {
                setUser(data)
                navigate('/campaigns', { replace: false })
            })
    }

    let isNextDisabled = true
    if (state.email && state.email.includes("@") && state.password.length >= 8 && (state.mode === 'login' || (state.name))) {
        isNextDisabled = false
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
                                setState({ ...state, mode: "signup" })
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
                                setState({ ...state, mode: "login" })
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
                                // autoComplete="email"
                                value={state.name}
                                onKeyDown={(e) => { if (e.key === "Enter") { SignIn() } }}
                                onChange={(e) => {
                                    setState({ ...state, name: e.target.value })
                                }}
                            />
                            <span className="icon is-left">
                                <FontAwesome6 icon={faEnvelope} />
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
                            // autoComplete="email"
                            value={state.email}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { SignIn() }
                            }}
                            onChange={(e) => {
                                setState({ ...state, email: e.target.value })
                            }}
                        />
                        <span className="icon is-left">
                            <FontAwesome6 icon={faEnvelope} />
                        </span>
                    </div>
                </div>
                <div className="field">
                    <div className="control has-icons-left">
                        <input
                            className="input"
                            type="password"
                            placeholder="Password"
                            // autoComplete="password"
                            value={state.password}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { SignIn() }
                            }}
                            onChange={(e) => {
                                setState({ ...state, password: e.target.value })
                            }}
                        />
                        <span className="icon is-left">
                            <FontAwesome6 icon={faLock} />
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
                        <Link to="/forgot" className="is-size-6 has-text-primary">
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
                                <FontAwesome6 icon={faArrowRight} />
                            </span>
                        </>
                    ) : (
                        <>
                            <span>Sign Up</span>
                            <span className="icon">
                                <FontAwesome6 icon={faPlus} />
                            </span>
                        </>
                    )}
                </button>
            </div>
        </>
    )
}

export function Logout({ ...props }) {
    const [done, setDone] = useState(false)

    useEffect(() => {
        axios
            .post('/auth/logout')
            .catch(console.log)
            .finally(() => {
                setDone(true)
            })
    }, [])

    if (done) {
        return <Navigate to="/" />
    }

    return <Loader fullpage={true} />
}

export function AuthPage({ mode, ...props }) {
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

// export function Forgot({ ...props }) {
//     const [state, setState] = useState({
//         email: "",
//         finished: false,
//     })

//     function submit() {
//         const { email } = state
//         const auth = getAuth()

//         if (!email || email.includes("@")) {
//             return
//         }

//         sendPasswordResetEmail(auth, email)
//             .then(() => {
//                 setState({ ...state, finished: true })
//             })
//             .catch((error) => {
//                 console.log({ errorCode: error.code, message: error.message })
//             })
//     }

//     if (state.finished) {
//         return (
//             <div className="hero is-halfheight">
//                 <div className="hero-body">
//                     <div className="container is-max-fullhd">
//                         <div className="subcontainer is-mini">
//                             <figure className="block image is-128x128 is-centered">
//                                 <img src={Logo} alt="Virtual DnD" />
//                             </figure>
//                             <div className="block box">
//                                 <div className="block has-text-centered">
//                                     <h1 className="title">An email has been sent to your account</h1>
//                                 </div>
//                                 <div className="block">
//                                     <p className="is-size-5">Please check your email for instructions to reset your password.</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="hero is-halfheight">
//             <div className="hero-body">
//                 <div className="container is-max-fullhd">
//                     <div className="subcontainer is-mini">
//                         <figure className="block image is-128x128 is-centered">
//                             <img src={Logo} alt="Virtual DnD" />
//                         </figure>
//                         <div className="block box">
//                             <div className="block">
//                                 <h1 className="title">Forgot Password</h1>
//                                 <h2 className="subtitle">Enter your email address to reset your password</h2>
//                             </div>
//                             <div className="block">
//                                 <div className="field">
//                                     <div className="control">
//                                         <input
//                                             autoFocus
//                                             className="input"
//                                             type="email"
//                                             placeholder="Email"
//                                             // autoComplete="email"
//                                             value={state.email}
//                                             onKeyDown={(e) => {
//                                                 if (e.key === "Enter") {
//                                                     submit()
//                                                 }
//                                             }}
//                                             onChange={(e) => {
//                                                 setState({ ...state, email: e.target.value })
//                                             }}
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="block buttons is-centered">
//                                 <button className="button is-primary is-fullwidth" disabled={!(state.email && state.email.includes("@"))} onClick={submit} type="button">
//                                     <span>Send Reset Instructions</span>
//                                     <span className="icon">
//                                         <FontAwesome6 icon={faEnvelope} />
//                                     </span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

export default (
    <>
        <Route index path="/" element={<AuthPage mode="login" />} />
        <Route index path="/login" element={<AuthPage mode="login" />} />
        <Route index path="/signup" element={<AuthPage mode="signup" />} />
        {/* <Route index path="/forgot" element={<AuthPage mode="forgot" />} /> */}
        <Route index path="/logout" element={<Logout />} />
    </>
)
