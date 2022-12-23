import { useState } from 'react'
import Database from './client.js'

export default function DBTest(){

    const [state, setState] = useState({
        getTestStatus: 'Untested',
        setTestStatus: 'Untested',
        pushTestStatus: 'Untested',
        subscribeTestStatus: 'Untested',
        deleteTestStatus: 'Untested',
        subscription: null
    })

    async function testGet(){
        const [row=null] = await Database.users.get({ where:{ email: 'alex@navarrocity.com' } }).catch(e => { console.log(e); return [0] })
        console.log({ getTest: row })
        setState({ ...state, getTestStatus: row&&row.email === 'alex@navarrocity.com'?'Success':'Failed' })
    }
    async function testDelete(){
        const test = await Database.users.delete({ where:{ email: 'alex@navarrocity.com' } }).then(() => { return true }).catch(e => { console.log(e); return false })
        setState({ ...state, getTestStatus:test?'Success':'Failed' })
    }
    async function testSet(){
        const new_value = new Date().toISOString()
        const result = await Database.users.set({
            where: { email: 'alex@navarrocity.com' },
            data: {
                name: new_value
            }
        }).catch(e => { console.log(e); return [0] })
        console.log({ testSet: result })
        setState({ ...state, setTestStatus: result && result.length?'Success':'Failed' })
    }
    async function testPush(){
        const result = await Database.users.push({
            data: {
                name: "Alex Navarro",
                email: "alex@navarrocity.com",
                password: "12i74984719824"
            }
        }).catch(console.log)
        console.log({ testPush: result })
        setState({ ...state, pushTestStatus: result && result.count?'Success':'Failed' })
    }
    function testSubscribe(){
        // Unsubscribe before re-subscribe
        if(state.subscription){
            console.log("Unsubscribing!")
            state.subscription()
        }
        const unsubscribe = Database.users.onValue({ where:{ email: 'alex@navarrocity.com' } }, function(value, error){
            if(error){
                console.error(error);
            }
            else {
                console.log(value)
            }
            setState({ ...state, subscribeTestStatus: value && value.email?'Success':'Failed', subscription: unsubscribe })
        })
        setState({ ...state, subscription: unsubscribe })
    }

    return (
        <section className="section">
            <div className="container is-max-desktop">
                <div className="block box level">
                    <button className="button is-primary" type="button" onClick={testGet}>
                        <span>Test Get Method</span>
                    </button>
                    <h1 className="title">{state.getTestStatus}</h1>
                </div>
                <div className="block box level">
                    <button className="button is-primary" type="button" onClick={testSet}>
                        <span>Test Set Method</span>
                    </button>
                    <h1 className="title">{state.setTestStatus}</h1>
                </div>
                <div className="block box level">
                    <button className="button is-primary" type="button" onClick={testPush}>
                        <span>Test Push Method</span>
                    </button>
                    <h1 className="title">{state.pushTestStatus}</h1>
                </div>
                <div className="block box level">
                    <button className="button is-primary" type="button" onClick={testSubscribe}>
                        <span>Test Subscribe Method</span>
                    </button>
                    <h1 className="title">{state.subscribeTestStatus}</h1>
                </div>
                <div className="block box level">
                    <button className="button is-primary" type="button" onClick={testDelete}>
                        <span>Test Delete Method</span>
                    </button>
                    <h1 className="title">{state.deleteTestStatus}</h1>
                </div>
            </div>
        </section>
    )

}