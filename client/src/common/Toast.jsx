import { useEffect, useState } from "react"

export default function Toast({ time=(1000*7), color="success", message, position="bottom" }){

    const [ visible, setVisible ] = useState(true)
    const [ started, setStarted ] = useState(false)
    const [ fadeOut, setFadeOut ] = useState(false)

    useEffect(() => {
        let t1 = setTimeout(() => { setStarted(true)  }, 1)
        let t2 = setTimeout(() => { setFadeOut(true)  }, time - 400)
        let t3 = setTimeout(() => { setVisible(false) }, time)

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            clearTimeout(t3)
        }
    }, [time])

    if(!visible){
        return <></>
    }

    return (
        <div className={`toast is-${position.split(' ').join(' is-')} transition`} style={{ opacity: fadeOut ? '0' : '1' }}>
            <div className={`notification is-${color} pt-4 pb-5`}>
                <button className="delete" onClick={() => { setFadeOut(true) }}></button>
                <div className="field">
                    <p>{ message }</p>
                </div>
                <div className="field">
                    <div
                        className="multi-progress no-animation is-justify-content-flex-end is-small"
                        style={{
                            height: '0.5em',
                            minHeight: '0.5em',
                            background: ["black", "dark"].includes(color) ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"
                        }}
                    >
                        <div
                            className={`progress-item is-${color}`}
                            style={{
                                padding:'0',
                                width: started?'100%':'0%',
                                transition: `width ${time}ms linear`
                            }}
                        />
                    </div>
                </div>

            </div>
        </div>
    )

}