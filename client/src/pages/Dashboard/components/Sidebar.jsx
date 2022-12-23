import { useContext } from 'react'
import { NavLink, Link } from 'react-router-dom'
import UserContext from 'context/User'

import { faUserGroup, faRightFromBracket, faGears } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import Styles from '../_.module.sass'

export default function Sidebar({ getState }) {
    const [user] = useContext(UserContext)
    const [state, setState] = getState

    return (
        <div className={Styles.Sidebar}>

            {/* Nametag */}
            <div className={"nametag " + Styles.nametag}>
                <figure className={"image is-64x64 is-rounded" + (user.image?'':' no-image')}>
                    { user.image
                        ? <img src={user.image} alt={user.name} referrerPolicy="no-referrer" />
                        : <span className="has-text-centered" style={{ minWidth: '64px' }}>{user.name.split(' ').map(a => a.substring(0,1)).join('')}</span>
                    }
                </figure>
                <div className="titles">
                    <p className="has-text-black has-text-weight-bold">{user.name}</p>
                    <p className="has-text-black">{user.email}</p>
                </div>
            </div>

            {/* Button Actions Bar */}
            <div className={"buttons is-centered has-addons " + Styles.sidebarButtons}>
                <button
                    className={"button is-" + (state.showFriends ? "primary" : "dark")}
                    type="button"
                    onClick={() => {
                        setState({ ...state, showFriends: !state.showFriends })
                    }}
                >
                    <span className="icon">
                        <FontAwesomeIcon icon={faUserGroup} />
                    </span>
                </button>
                <button
                    className={"button is-" + (state.showSettings ? "primary" : "dark")}
                    type="button"
                    onClick={() => {
                        setState({ ...state, showSettings: !state.showSettings })
                    }}
                >
                    <span className="icon">
                        <FontAwesomeIcon icon={faGears} />
                    </span>
                </button>
                <Link to="/logout" className="button is-dark">
                    <span className="icon">
                        <FontAwesomeIcon icon={faRightFromBracket} />
                    </span>
                </Link>
            </div>

            {/* Sidebar Items */}
            <NavLink to="/logout" className={({ isActive }) => Styles.SidebarItem + (isActive ? " " + Styles.isActive : "")}>
                <span>Logout</span>
            </NavLink>
        </div>
    )
}