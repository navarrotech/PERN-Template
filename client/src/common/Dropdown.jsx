import { useState, useRef } from 'react'

export default function Dropdown({ trigger, children, ...props }){

    const [open, setOpen] = useState(false)
    const dropdown = useRef()

    // useEffect(() => {
    //     if(!open){ return }
    //     let { current:element=null } = dropdown
    //     if(!element){ return }

    //     function listener({ target }){
    //         console.log("Click triggered!")
    //         // if(!target.contains(element)){
    //         //     document.removeEventListener('click', listener)
    //         //     setOpen(false)
    //         // }
    //     }

    //     document.addEventListener('click', listener)
    //     return () => {
    //         document.removeEventListener('click', listener)
    //     }
    // }, [open])

    return (
        <div className={"dropdown" + (open?' is-active':'')} ref={dropdown}>
            <div className="dropdown-trigger is-clickable" onClick={() => { setOpen(!open) }}>
                { trigger }    
            </div>
            <div className="dropdown-menu">
                <div className="dropdown-content">
                    { children }
                </div>
            </div>
        </div>
    )

}