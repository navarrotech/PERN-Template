import { createContext, useState, useEffect } from "react"

import Loader from "../common/Loader.jsx"

import axios from 'axios'

const Context = createContext()

export default Context

export function UserProvider({ children }) {

    const [state, setState] = useState({
        loading: true,
        user: [null, () => {}],
    })

    // When the user state changes in the cloud, update it here too.
    // useEffect(() => {
    //     function setSubstate(newState) {
    //         setState((oldState) => {
    //             return {
    //                 ...oldState,
    //                 loading: false,
    //                 user: [newState, setSubstate]
    //             }
    //         })
    //     }
    //     axios
    //         .post('/auth/getAuth')
    //         .catch(e => {
    //             console.log(e)
    //             // Put 401 catch in, to redirect back to '/'
    //             Promise.reject(e)
    //         })
    //         .then(({ data:{ user }={} }) => {
    //             setSubstate(user)
    //         })
    // }, [])

    // if (state.loading) {
    //     return <Loader />
    // }

    return <Context.Provider value={state.user}>{children}</Context.Provider>
}
