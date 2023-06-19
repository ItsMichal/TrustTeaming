import React from 'react'
import ReactDOM from 'react-dom'
import { io } from 'socket.io-client'
import { DateTime } from 'luxon'
// import { motion } from "framer-motion"
import { ConfigAccordion } from './accordion'
import { offenseToIcon } from './crimes'
import '../assets/css/global.css'

function ConfigRow(props) {
    console.log('NOOOO')
    console.log(props)
    return (
        <tr className='w-100 text-center border-gray border-b'>
            <td className='py-2'>{props.round_id}</td>
            <td className='py-2'>{props.user_id}</td>
            <td className='py-2'>{props.question}</td>
            <td className='py-2'>
                <div className='flex flex-row place-content-center'>
                    {props.layers.map((layer, index) => {
                        return (
                            <img
                                key={'img_' + index}
                                className='h-12 flex-shrink'
                                src={offenseToIcon[layer]}
                            ></img>
                        )
                    })}
                </div>
            </td>
        </tr>
    )
}

function stopExperiment(code) {
    socket.emit('stopExperiment', { code: code })
    document.getElementById('statusHead_' + code).innerHTML = 'Stopping...'
}

function UserTable({ users, code }) {
    return Object.keys(users).map((user, index) => {
        let key = users[user].userId + '_' + index + '_' + code
        return (
            <tr key={key} className='w-100'>
                <td colSpan={2}>
                    <div
                        key={key + '_1'}
                        className='w-100 text-center border-gray border-b'
                    >
                        <div className='py-2 font-bold row-span-2'>
                            User {users[user].userId}
                        </div>
                    </div>
                    <div
                        key={key + '_2'}
                        className='flex flex-row  w-100 text-center border-gray border-b'
                    >
                        <div className='font-bold mr-5 py-2 w-min '>
                            {Object.keys(users[user].scores).map(
                                (score, index2) => {
                                    return (
                                        <div
                                            key={
                                                'scorename_' +
                                                key +
                                                '_' +
                                                index2
                                            }
                                        >
                                            Round {score}
                                        </div>
                                    )
                                },
                            )}
                        </div>
                        <div className='py-2'>
                            {Object.keys(users[user].scores).map(
                                (score, index2) => {
                                    return (
                                        <div
                                            key={'score_' + key + '_' + index2}
                                        >
                                            {users[user].scores[score]}
                                        </div>
                                    )
                                },
                            )}
                        </div>
                    </div>
                </td>
            </tr>
        )
    })
}

function ConfigLive(props) {
    console.log(props.liveExperiment)
    if (props.liveExperiment == undefined) {
        return (
            <h3 id={'notLive_' + props.code} className='border-b-2 py-1'>
                Experiment is not live.{' '}
                <button
                    onClick={() => startExperiment(props.code)}
                    className='bg-blue-500 p-2 text-white border border-b-4 border-blue-600 shadow-md hover:border-blue-800 active:mt-0.5 active:border-b-2 hover:bg-blue-600 hover:shadow-sm active:bg-blue-600 active:text-blue-100  active:shadow-inner rounded-xl'
                >
                    Start
                </button>
            </h3>
        )
    } else {
        return (
            <div className='border-b-2 py-1'>
                <table className='table p-4 w-full'>
                    <thead>
                        <tr>
                            <th
                                colSpan='2'
                                id={'statusHead_' + props.code}
                                className='border-b-2 font-bold p-4 dark:border-dark-5 whitespace-nowrap text-xl text-gray-900'
                            >
                                <span className='animate-pulse text-white bg-red-500 rounded-xl p-1 ml-2 text-xs'>
                                    LIVE
                                </span>
                                Status
                                <button
                                    onClick={() => stopExperiment(props.code)}
                                    className='bg-red-500 text-sm ml-2 p-2 text-white border border-b-4 border-red-600 shadow-md hover:border-red-800 active:mt-0.5 active:border-b-2 hover:bg-red-600 hover:shadow-sm active:bg-red-600 active:text-red-100  active:shadow-inner rounded-xl'
                                >
                                    Stop! (Destroys Data)
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className='w-100 text-center border-gray border-b'>
                            <td className='py-2 font-bold'>
                                Time Since Initialization
                            </td>
                            <td className='py-2'>
                                Initialized{' '}
                                {DateTime.fromISO(
                                    props.liveExperiment.timeStarted + ' UTC',
                                ).toRelative()}
                            </td>
                        </tr>

                        <tr className='w-100 text-center border-gray border-b'>
                            <td className='py-2 font-bold'>Current State</td>
                            <td className='py-2'>
                                {props.liveExperiment.liveCore.state}{' '}
                            </td>
                        </tr>
                        <tr className='w-100 text-center border-gray border-b'>
                            <td className='py-2 font-bold'>Round</td>
                            <td className='py-2'>
                                {props.liveExperiment.curRoundNum}
                            </td>
                        </tr>
                        <tr className='w-100 text-center border-gray border-b'>
                            <td className='py-2 font-bold'>
                                Time Since Round Started
                            </td>
                            <td className='py-2'>
                                {DateTime.fromISO(
                                    props.liveExperiment.timeRoundStarted + 'Z',
                                ).toRelative()}
                            </td>
                        </tr>
                        <tr className='w-100 text-center border-gray border-b'>
                            <td className='py-2 font-bold'>Pins Placed</td>
                            <td className='py-2'>
                                {
                                    Object.keys(
                                        props.liveExperiment.liveCore.curPins,
                                    ).length
                                }
                            </td>
                        </tr>
                        <UserTable
                            users={props.liveExperiment.liveCore.users}
                            code={props.code}
                        />
                        <tr className='w-100 text-center border-gray border-b'>
                            <td className='py-2 font-bold'>
                                Download Logged Results
                            </td>
                            <td className='py-4'>
                                <a
                                    href={`downloadResults?code=${props.liveExperiment.code}`}
                                    className='bg-blue-500 p-1 text-white border border-b-4 border-blue-600 shadow-md hover:border-blue-800 active:mt-0.5 active:border-b-2 hover:bg-blue-600 hover:shadow-sm active:bg-blue-600 active:text-blue-100  active:shadow-inner rounded-xl'
                                >
                                    Download
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

function startExperiment(code) {
    socket.emit('sendStart', { code: code })
    document.getElementById('notLive_' + code).innerHTML = 'Loading...'
}

function ConfigTable(props) {
    //Sends a post request to /deleteExperiment with the code of the experiment to delete
    function deleteExperiment(code) {
        console.log('Deleting code: ' + code + '')

        //Display a warning popup
        if (!confirm('Are you sure you want to delete this experiment?')) {
            return
        }

        fetch('deleteExperiment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code }),
        }).then(res => {
            if (res.status == 200) {
                //refresh page
                window.location.reload()
                console.log('Deleted')
            } else {
                console.log('Error deleting')
            }
        })
    }

    return (
        <div className='bg-white shadow rounded-lg p-5 my-5'>
            <div className='flex flex-row border-b-2 pb-3'>
                <h2 className='font-bold text-xl'>
                    <small className='text-gray-500'>CODE: </small>
                    {props.code}
                </h2>
                <div className='flex-grow'></div>
                <div
                    className='bg-red-500 p-2 
            text-white border border-b-4 border-red-600 
            shadow-md hover:border-red-800 active:mt-0.5 
            active:border-b-2 hover:bg-red-600 hover:shadow-sm 
            active:bg-red-600 active:text-red-100  
            active:shadow-inner rounded-xl'
                    onClick={() => {
                        deleteExperiment(props.code)
                    }}
                >
                    Delete Experiment!
                </div>
            </div>
            <ConfigLive
                liveExperiment={props.liveExperiment}
                code={props.code}
            ></ConfigLive>
            <div className='bg-gray-100 shadow rounded-lg p-5 my-5'>
                <ConfigAccordion
                    topElement={
                        <h3 className='border-b-2 py-1 text-center text-xl font-bold'>
                            Configuration
                        </h3>
                    }
                    innerElement={
                        <div>
                            <div className='border-b-2 py-1'>
                                <b>Valid Users </b>

                                {props.valid_uids.map(uid => {
                                    return (
                                        <span
                                            key={uid}
                                            className='underline mx-2'
                                        >
                                            {uid}
                                        </span>
                                    )
                                })}
                            </div>
                            <table className='table p-4 w-full'>
                                <thead>
                                    <tr>
                                        <th className='border-b-2 p-4 dark:border-dark-5 whitespace-nowrap font-normal text-gray-900'>
                                            Round #
                                        </th>
                                        <th className='border-b-2 p-4 dark:border-dark-5 whitespace-nowrap font-normal text-gray-900'>
                                            User #
                                        </th>
                                        <th className='border-b-2 p-4 dark:border-dark-5 whitespace-nowrap font-normal text-gray-900'>
                                            Question
                                        </th>
                                        <th className='border-b-2 p-4 dark:border-dark-5 whitespace-nowrap font-normal text-gray-900'>
                                            Layers
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.rounds.map(round => {
                                        console.log(round)
                                        return (
                                            <ConfigRow
                                                key={
                                                    props.code +
                                                    '_' +
                                                    round.round_id +
                                                    '_' +
                                                    round.user_id
                                                }
                                                round_id={round.round_id}
                                                user_id={round.user_id}
                                                question={round.question}
                                                layers={round.layers}
                                            ></ConfigRow>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    }
                ></ConfigAccordion>
            </div>
            <div className='bg-gray-100 shadow rounded-lg p-5 my-5'>
                <ConfigAccordion
                    topElement={
                        <h3 className='border-b-2 py-1 text-center text-xl font-bold'>
                            AI Instructions
                        </h3>
                    }
                    innerElement={
                        <ActorInstructionUpload
                            code={props.code}
                        ></ActorInstructionUpload>
                    }
                ></ConfigAccordion>
            </div>
        </div>
    )
}

function ActorInstructionUpload({ code }) {
    return (
        <>
            <form
                action='instructionsUpload'
                method='post'
                encType='multipart/form-data'
            >
                <h1 className='text-2xl pt-2 pb-5 font-bold'>
                    New Instructions Upload
                </h1>
                {/* <div className=" relative pb-10">
                    <label htmlFor="required-code" className="text-gray-700">
                        Code
                        <span className="text-red-500 required-dot">
                            *
                        </span>
                    </label>
                    <input type="text" id="required-code" className=" rounded-lg border-transparent appearance-none border border-gray-300  py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" name="code" placeholder="Max. 10 Characters"/>
                    <label htmlFor="forceBox" className="ml-10 text-gray-700">
                        Force?
                        <span className="text-red-500 required-dot">
                            *
                        </span>
                    </label>
                    <input type="checkbox" className="p-10" id="forceBox" name="force"/>

                </div> */}
                <input type='hidden' name='code' value={code}></input>

                <label htmlFor='config' className='text-gray-700'>
                    CSV File<span className='text-red-500 required-dot'>*</span>
                </label>
                <br />
                <input
                    type='file'
                    id='config'
                    name='config'
                    accept='text/csv'
                ></input>
                <input
                    className='bg-black text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                    value='Upload Config'
                    type='submit'
                ></input>
            </form>
        </>
    )
}

class ConfigView extends React.Component {
    constructor(props) {
        super(props)
        this.state = { liveExperiment: {} }
        props.configs.forEach(element => {
            this.setState({
                liveExperiment: {
                    ...this.state.liveExperiment,
                    [element.code]: 'Loading...',
                },
            })
        })
        socket.on('liveexp', this.updateState)
        socket.emit('sendLive')
    }
    updateState = liveExperiments => {
        console.log('UPDATING', liveExperiments.liveExperiments)
        this.setState({
            liveExperiment: liveExperiments.liveExperiments,
        })
    }
    tick() {
        socket.emit('sendLive')
    }
    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 5000)
    }
    componentWillUnmount() {
        clearInterval(this.timerID)
    }
    render = () => {
        return (
            <>
                <h1 className='font-bold text-2xl p-2 mb-5'>Configs</h1>
                {this.props != undefined &&
                    this.props.configs.map(config => {
                        return (
                            <ConfigTable
                                key={config.code}
                                liveExperiment={
                                    this.state.liveExperiment[config.code]
                                }
                                valid_uids={config.valid_uids}
                                code={config.code}
                                rounds={config.rounds}
                            ></ConfigTable>
                        )
                    })}
            </>
        )
    }
}

//https://stackoverflow.com/questions/39019094/reactjs-get-json-object-data-from-an-url
function getConfigs() {
    return fetch('/admin/getConfig')
        .then(response => response.json())
        .then(responseJson => {
            return responseJson
        })
        .catch(error => {
            console.error(error)
        })
}

const socket = io('/admin')

socket.on('connect', () => {
    console.log('Connected to ' + socket.nsp)
})

function renderConfigView() {
    getConfigs().then(configs => {
        ReactDOM.render(
            <ConfigView configs={configs.configs}></ConfigView>,
            document.getElementById('configView'),
        )
    })
}
renderConfigView()

//  ReactDOM.render()
