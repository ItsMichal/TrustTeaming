import * as React from 'react'
import '../assets/css/global.css'
import { io } from 'socket.io-client'
// import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { ReviewMap, SharedMap, SharedPin } from '../webScripts/map'
import { DefaultPanel, ReadyPanel } from './readyUp'

//import user icons
import aiIcon from '../assets/img/user_icons/ai_icon.png'
import userOneIcon from '../assets/img/user_icons/user_one.png'
import userTwoIcon from '../assets/img/user_icons/user_two.png'
import userIcon from '../assets/img/user_icons/user_icon.png'

//TODO: Refactor out pin logic, maybe sidebar logic too?

//globals
var liveSocket
var pinColor = 'green'
var markers = []
var userId
var latestLiveData
const sharedMapRoot = createRoot(document.getElementById('map'))
const infoRoot = createRoot(document.getElementById('info'))
const pinChooserRoot = createRoot(document.getElementById('pinChooser'))
const userPanelRoot = createRoot(document.getElementById('userPanel'))

//This is how the server logic connects to the map logic,
//in regards to the pins.
let mapHandlers = {
    move: (pinId, lat, lon) => {
        movePin(pinId, userId, lat, lon)
    },
    delete: pinId => {
        deletePin(pinId, userId)
    },
    place: (lat, lon, color) => {
        placePin(lat, lon, color, userId)
    },
}

//Receives live data periodically from socket
// function LiveDataHook(data){
//     //TODO - Complete this
//     console.log(data);
// }

export function UserPanel({ userId, ready, scores }) {
    let prevScore = 0

    //Get prev score
    if (
        Object.prototype.hasOwnProperty.call(
            scores,
            latestLiveData.curRoundCfg.roundId - 1,
        )
    ) {
        prevScore = scores[latestLiveData.curRoundCfg.roundId - 1]
    }

    //Get total score
    let totalScore = Object.values(scores).reduce((sum, cur) => {
        return sum + cur
    }, 0)

    function UserIcon() {
        //if ai, use ai Icon, and center within div
        if (userId.toLowerCase() == 'ai') {
            //return ai icon

            return (
                <div className='flex justify-center items-center'>
                    <img className='w-16 h-16 rounded-full' src={aiIcon} />
                </div>
            )
        } else if (userId.toLowerCase() == '1') {
            //if user, use user icon
            return (
                <div className='flex justify-center items-center'>
                    <img className='w-16 h-16 rounded-full' src={userOneIcon} />
                </div>
            )
        } else if (userId.toLowerCase() == '2') {
            //if user, use user icon
            return (
                <div className='flex justify-center items-center'>
                    <img className='w-16 h-16 rounded-full' src={userTwoIcon} />
                </div>
            )
        } else {
            //if user, use user icon
            return (
                <div className='flex justify-center items-center'>
                    <img className='w-16 h-16 rounded-full' src={userIcon} />
                </div>
            )
        }
    }

    return (
        <div className='mx-5 m-2 border bg-slate-900 font-bold rounded-xl border-slate-900'>
            <h2 className='text-stone-100 text-center uppercase'>
                User {userId}
            </h2>
            <div className='bg-stone-200 p-2 rounded-bl-xl rounded-br-xl'>
                <div className='grid grid-cols-4 gap-2 w-full'>
                    <div className='overflow-clip '>
                        <UserIcon />
                    </div>
                    <div className='overflow-clip'>
                        <div className='uppercase text-sm text-slate-600/80'>
                            Status
                        </div>
                        <h3>{ready ? 'Ready' : 'Not Ready'}</h3>
                    </div>
                    <div className='overflow-clip'>
                        <div className='uppercase text-sm text-slate-600/80'>
                            Prev. Score
                        </div>
                        <h3>
                            {prevScore == 0 ? '$0' : `$${prevScore.toFixed(2)}`}
                        </h3>
                    </div>
                    <div className='overflow-clip'>
                        <div className='uppercase text-sm text-slate-600/80'>
                            Tot. Score
                        </div>
                        <h3>{`$${totalScore.toFixed(2)}`}</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

//React component to handle picking the pin color
//and possibly showing the remaining amount of pins in each
//color as well

function ChoosePin({ greenPins, redPins, pinColorHook, disabled }) {
    //TODO - create this
    const [pinColor, setPinColor] = useState('green')

    function pinColorSelect(color) {
        setPinColor(color)
        pinColorHook(color)
    }

    function GreenBtn() {
        if (pinColor == 'green') {
            return (
                <div className='p-2 bg-green-500 rounded-xl'>
                    Using Green{' '}
                    <div className='font-semibold text-sm'>
                        {greenPins} remaining
                    </div>
                </div>
            )
        } else {
            return (
                <div
                    onClick={() => {
                        pinColorSelect('green')
                    }}
                    className='p-2 border-green-500 border-2 hover:bg-green-300 rounded-xl'
                >
                    Green{' '}
                    <div className='font-semibold text-sm'>
                        {greenPins} remaining
                    </div>
                </div>
            )
        }
    }

    function RedBtn() {
        if (pinColor == 'red') {
            return (
                <div className='p-2 bg-red-500 rounded-xl'>
                    Using Red{' '}
                    <div className='font-semibold text-sm'>
                        {redPins} remaining
                    </div>
                </div>
            )
        } else {
            return (
                <div
                    onClick={() => {
                        pinColorSelect('red')
                    }}
                    className='p-2 border-red-500 hover:bg-red-300 border rounded-xl'
                >
                    Red{' '}
                    <div className='font-semibold text-sm'>
                        {redPins} remaining
                    </div>
                </div>
            )
        }
    }

    if (disabled) {
        return (
            <div className='font-bold animate-pulse px-5 text-center'>
                Awaiting Round Start
            </div>
        )
    } else {
        return (
            <>
                <div className='grid grid-cols-2 gap-2 px-5 text-center font-bold'>
                    <GreenBtn></GreenBtn>
                    <RedBtn></RedBtn>
                </div>
            </>
        )
    }
}

//This is a data panel that will show pertinent
//live statistics to the user
function DataPanel({ config, userId }) {
    const [timeRoundStarted, settimeRoundStarted] = useState(0)

    React.useEffect(() => {
        function updateTime() {
            if (config.timeRoundStarted != null && config.state == 'running') {
                let diff =
                    (new Date(config.timeRoundStarted + ' UTC').getTime() +
                        config.curRoundCfg.time * 1000 -
                        new Date().getTime()) /
                    1000
                settimeRoundStarted(Math.round(diff) + 's')
            } else {
                settimeRoundStarted('N/A')
            }
        }
        updateTime()

        function updateTimeSync() {
            setTimeout(() => {
                updateTime()
            }, (new Date(config.timeRoundStarted + ' UTC').getMilliseconds() - new Date().getMilliseconds() + 1000) % 1000)
        }

        //The set timeout is a way to sync the local interal to the server interval
        //note that this probably has delays in the order of a few ms, so testing
        //may be needed
        //TODO test the delay between the actual and displayed
        let interval = setInterval(updateTimeSync, 200)

        return () => clearInterval(interval)
    }, [config.timeRoundStarted, config.state])

    let curRoundCfg = config.curRoundCfg //config.rounds[config.curRoundNum + "_"+userId]

    if (curRoundCfg == undefined) {
        return <>ERROR: No matching config found!</>
    }
    console.log(config)

    return (
        <div className='mx-5 m-2 border bg-slate-900 font-bold rounded-xl border-slate-900'>
            <h2 className='text-stone-100 text-center uppercase animate-pulse'>
                Live Data
            </h2>
            <div className='bg-stone-200 p-2 rounded-bl-xl rounded-br-xl'>
                <div className='mb-2'>
                    <div className='uppercase text-sm text-slate-600/80'>
                        Question
                    </div>
                    <h2 className='text-xl'>{curRoundCfg.question}</h2>
                </div>
                <div className='columns-4 gap-2'>
                    <div className='w-full'>
                        <div className='uppercase text-sm text-slate-600/80'>
                            Round
                        </div>
                        <h3>{curRoundCfg.roundId}</h3>
                    </div>
                    <div className='w-full'>
                        <div className='uppercase text-sm text-slate-600/80'>
                            Time Rem.
                        </div>
                        <h3>{timeRoundStarted}</h3>
                    </div>
                    <div className='w-full'>
                        <div className='uppercase text-sm text-slate-600/80'>
                            State
                        </div>
                        <h3>{config.state}</h3>
                    </div>
                    <div className='w-full'>
                        <div className='uppercase text-sm text-slate-600/80'>
                            Earned
                        </div>
                        {/* sum scores from all users, kinda ugly lookin code but
                            that's what it does and works well. 
                            Nested reduces- goes thru users, sums their score up first, 
                            then sums all those to get the final result.

                            Might look at calculating this on backend and then just
                            serving that, but perf cost isn't truly alot here
                        */}
                        <h3>
                            $
                            {Object.keys(config.users)
                                .reduce((acc, cur) => {
                                    console.log(config.users[cur])
                                    return (
                                        acc +
                                        Object.keys(
                                            config.users[cur].scores,
                                        ).reduce((acc2, cur2) => {
                                            return (
                                                acc2 +
                                                config.users[cur].scores[cur2]
                                            )
                                        }, 0)
                                    )
                                }, 0)
                                .toFixed(2)}
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

function onLiveData(data) {
    //TODO- figure out if race condition exists,
    //for example, if user places pin while getting update?
    //currently think server overrides client- so client
    //simply has to re-enter
    console.log('WOWOWOWOO', data)
    latestLiveData = data

    let newMarkerArr = []
    Object.values(data.curPins).forEach(pin => {
        newMarkerArr = [
            ...newMarkerArr,
            <SharedPin
                key={pin.pinId + '_mapPin'}
                pinId={pin.pinId}
                lat={pin.lat}
                lon={pin.lon}
                color={pin.color}
                pinHandlers={mapHandlers}
                {...pin}
            />,
        ]
    })

    setMarkers(newMarkerArr)

    updateView()
}

function setMarkers(input) {
    markers = input
    //TODO send update to server!
}

function getConfig() {
    return fetch('/trust/shared/requestConfig')
        .then(response => response.json())
        .then(respJson => {
            return respJson
        })
        .catch(err => {
            console.log(err)
        })
}

function selectColor(color) {
    pinColor = color

    sharedMapRoot.render(
        <SharedMap
            pinHandlers={mapHandlers}
            markers={markers}
            currentColor={pinColor}
        ></SharedMap>,
    )
}

function placePin(lat, lon, color, userId) {
    liveSocket.emit('pinPlaced', {
        lat: lat,
        lon: lon,
        color: color,
        userId: userId,
    })
}

function deletePin(pinId, userId) {
    liveSocket.emit('pinDeleted', { userId: userId, pinId: pinId })
}

function movePin(pinId, userId, lat, lon) {
    liveSocket.emit('pinMoved', {
        userId: userId,
        pinId: pinId,
        lat: lat,
        lon: lon,
    })
}

function readyUp() {
    console.log('READY', userId)
    liveSocket.emit('readyUp', { userId: userId })
}

function readyReview() {
    liveSocket.emit('readyUp', { userId: userId, review: true })
}

//Rerenders the map with the latest
//global variable values
function updateView() {
    if (latestLiveData != undefined) {
        if (latestLiveData.state == 'running') {
            sharedMapRoot.render(
                <SharedMap
                    markers={markers}
                    currentColor={pinColor}
                    pinHandlers={mapHandlers}
                ></SharedMap>,
            )
        } else if (latestLiveData.state == 'idle') {
            console.log('update data!')
            sharedMapRoot.render(
                <div className='bg-white w-fit p-5 h-fit rounded-lg m-auto'>
                    <ReadyPanel
                        users={latestLiveData.users}
                        readyHook={readyUp}
                    ></ReadyPanel>
                </div>,
            )
        } else if (latestLiveData.state == 'review') {
            sharedMapRoot.render(
                <ReviewMap
                    pins={latestLiveData.curPins}
                    crimesJson={latestLiveData.reviewCrimes}
                />,
            )
            userPanelRoot.render(
                <ReadyPanel
                    survey={latestLiveData.curRoundCfg.surveyLink}
                    users={latestLiveData.users}
                    readyHook={readyReview}
                ></ReadyPanel>,
            )
        } else if (latestLiveData.state == 'survey') {
            sharedMapRoot.render(
                <div className='bg-white w-fit p-5 h-fit rounded-lg m-auto'>
                    <ReadyPanel
                        survey={latestLiveData.curRoundCfg.surveyLink}
                        users={latestLiveData.users}
                        readyHook={readyReview}
                        title={'Survey Time!'}
                    ></ReadyPanel>
                </div>,
            )
        } else {
            sharedMapRoot.render(
                <DefaultPanel
                    message={`Experiment is now ${latestLiveData.state}. Contact proctor for more info.`}
                ></DefaultPanel>,
            )
        }

        if (latestLiveData.state != 'review') {
            userPanelRoot.render(
                Object.values(latestLiveData.users).map(user => {
                    return (
                        <UserPanel
                            key={user.userId + '_panel'}
                            {...user}
                        ></UserPanel>
                    )
                }),
            )
        }

        console.log('LIVE DATA', latestLiveData)

        infoRoot.render(
            <DataPanel config={latestLiveData} userId={userId}></DataPanel>,
        )

        //calculate pins remaining
        let greenPins = latestLiveData.curRoundCfg.maxGreen
        let redPins = latestLiveData.curRoundCfg.maxRed
        latestLiveData != undefined &&
            Object.values(latestLiveData.curPins).forEach(pin => {
                if (!pin.aiPlaced) {
                    if (pin.color == 'green') {
                        greenPins--
                    } else if (pin.color == 'red') {
                        redPins--
                    }
                }
            })
        console.log(greenPins, redPins)
        pinChooserRoot.render(
            <ChoosePin
                greenPins={greenPins}
                redPins={redPins}
                pinColorHook={selectColor}
                disabled={latestLiveData.state != 'running'}
            ></ChoosePin>,
        )
    }
}

//DEPREC
// function updateOverallCfg(){
//     getConfig().then((config) => {
//         latestOverallCfg = config;
//         latestRoundCfg = config.config.config.rounds[config.config.curRoundNum+"_"+config.user];
//     })
// }

function init() {
    //Get code and details from socket
    getConfig().then(cfg => {
        // latestOverallCfg = cfg; //update global cfg
        userId = cfg.user
        console.log('Got config ', userId)
        liveSocket = io('/live' + cfg.code)
        liveSocket.on('sharedLiveData', data => {
            onLiveData(data)
        })
        liveSocket.on('connect', () => {
            console.log('Connected to live socket.')
            liveSocket.emit('requestLiveData')
        })

        // latestRoundCfg = cfg.config.config.rounds[cfg.config.curRoundNum + "_"+cfg.user]; //sorry

        updateView()
    })
}

init()

// socket.on('connect', ()=>{
//     console.log("Connected to " + socket.nsp);
//     init()
// });
