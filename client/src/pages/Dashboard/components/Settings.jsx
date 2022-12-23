import { useContext, useState } from 'react'
import UserContext from 'context/User'

import { faUser, faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import axios from 'axios'

// import Styles from '../_.module.sass'

export default function SettingsModal({ closeModal, ...props }) {
    const [ user, setUser ] = useContext(UserContext)

    const [ state, setState ] = useState({
        name: user.name,
        password: user.password,
        email: user.email
    })

    function save(update) {
        if (!update || !Object.keys(update).length) {
            return
        }
        axios
            .post('/auth/update', update)
            .catch(console.log)
            .then(({ data }={}) => {
                if(data){ setUser(data) }
            })
    }

    return (
        <div className={"modal is-active"}>
            <div className="modal-background" onClick={closeModal}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Account Settings</p>
                    <button className="delete is-medium" onClick={closeModal}></button>
                </header>
                <section className="modal-card-body">
                    <div className="columns is-vcentered">
                        <div className="column is-3">
                            <figure
                                className={"image is-128x128 is-centered is-rounded is-clickable" + (user.image?'':' no-image')}
                                onClick={() => { setState({ ...state, showChooseAvatar: true }) }}
                            >
                                { user.image
                                    ? <img src={user.image} alt={user.name} />
                                    : <span>{user.name.split(' ').map(a => a.substring(0,1)).join('')}</span>
                                }
                            </figure>
                        </div>

                        <div className="column">
                            <div className="field">
                                <label className="label">Your Full Name</label>
                                <div className="control has-icons-left">
                                    <input
                                        className="input"
                                        type="text"
                                        placeholder="Name"
                                        value={state.name}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.target.blur()
                                            }
                                        }}
                                        onChange={(e) => {
                                            setState({ ...state, name: e.target.value })
                                        }}
                                        onBlur={() => save({ name: state.name })}
                                    />
                                    <span className="icon is-left">
                                        <FontAwesomeIcon icon={faUser} />
                                    </span>
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Email Address</label>
                                <div className="control has-icons-left"  onClick={() => console.log(user)}>
                                    <input className="input" type="email" placeholder="Email" value={user.email} disabled={true}/>
                                    <span className="icon is-left">
                                        <FontAwesomeIcon icon={faEnvelope} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <footer className="modal-card-foot buttons is-right">
                    <button className="button" type="button" onClick={closeModal}>
                        <span>Cancel</span>
                    </button>
                    <button className="button is-primary" type="button" onClick={closeModal}>
                        <span>Save</span>
                    </button>
                </footer>
            </div>
        </div>
    )
}