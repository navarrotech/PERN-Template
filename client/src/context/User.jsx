import { createContext, useState, useEffect } from "react"
import { useLocation } from 'react-router'
import Loader from "../common/Loader.jsx"

const Context = createContext()

export default Context

export function UserProvider({ children }) {

    const location = useLocation()
    const [state, setState] = useState({
        loading: true,
        user: [null, () => {}],
    })

    // When the user state changes in the cloud, update it here too.
    useEffect(() => {
        function setSubstate(newState) {
            setState((oldState) => {
                return {
                    ...oldState,
                    loading: false,
                    user: [newState, setSubstate]
                }
            })
        }
    }, [location])

    if (state.loading) {
        return <Loader />
    }

    return <Context.Provider value={state.user}>{children}</Context.Provider>
}
