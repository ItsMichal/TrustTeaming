// Creates an element that allows a user to create an experiment configuration, and edit rounds
// as well as download the config as a csv. Also allows the user to directly edit a live config.

import React, { useEffect } from 'react'
// import ReactDOM from 'react-dom'
import { io } from 'socket.io-client'
// import { DateRange } from 'react-date-range'
import { useState } from 'react'
import 'react-date-range/dist/styles.css' // main style file
import '../assets/css/cal.css' // theme css file
import '../assets/css/global.css' //global tailwind theme
import { motion, AnimatePresence } from 'framer-motion'

import userIcon from '../assets/img/user_icons/user_icon.png'
import redPinIcon from '../assets/img/icons/red.png'
import greenPinIcon from '../assets/img/icons/green.png'

import { offenses, offenseToIcon, offensesToReadable } from './crimes'

//Set up socket connection

const socket = io('/admin')
socket.on('connect', () => {
    console.log('connected to socket')
})

//Config Panel component, that allows for editing of the experiment config

//data format from socket-

// {
//     "config": {
//         "rounds":
// }

//collapsible panel component
function CollapsiblePanel({ title, children, open }) {
    let [isOpen, setOpen] = useState(open)
    return (
        <div className='w-full my-3 flex flex-row'>
            <button
                className='w-10 h-10 text-xl'
                onClick={() => {
                    setOpen(!isOpen)
                }}
            >
                {isOpen ? '▼' : '>>'}
            </button>
            <div className='w-full bg-stone-300/30 rounded-lg border border-stone-300/50 shadow-inner'>
                {/* Title */}
                <div
                    className='w-full flex flex-row justify-between items-center text-lg px-4'
                    onClick={() => {
                        setOpen(!isOpen)
                    }}
                >
                    {title}
                </div>
                {/* Content */}
                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.section
                            className='w-full'
                            key='content'
                            initial='collapsed'
                            animate='open'
                            exit='collapsed'
                            variants={{
                                open: { opacity: 1, height: 'auto' },
                                collapsed: { opacity: 0, height: 0 },
                            }}
                            transition={{
                                applyAtStart: {
                                    height: {
                                        duration: 1,
                                        ease: [0.04, 0.62, 0.23, 0.98],
                                    },
                                    opacity: {
                                        delay: 1,
                                        duration: 2,
                                        ease: [0.04, 0.62, 0.23, 0.98],
                                    },
                                },
                                applyAtEnd: {
                                    height: {
                                        delay: 2,
                                        duration: 1,
                                        ease: [0.04, 0.62, 0.23, 0.98],
                                    },
                                    opacity: {
                                        duration: 2,
                                        ease: [0.04, 0.62, 0.23, 0.98],
                                    },
                                },
                            }}
                        >
                            <div className='w-full px-4 pb-4'>{children}</div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

//responsible for rendering the config panels for each config
// function ConfigView({ configs }) {}

export function ConfigPanel({ config }) {
    let [rounds, setRounds] = useState(collapseRounds(config))
    let [actorInstructions, setActorInstructions] = useState(
        splitInstructionsByRound(config.actorInstructions),
    )
    let [changesMade, setChangesMade] = useState(false)
    let [workingConfig, setWorkingConfig] = useState({ ...config })
    let code = config.code

    useEffect(() => {
        setWorkingConfig(config)
        setRounds(collapseRounds(config))
        setActorInstructions(splitInstructionsByRound(config.actorInstructions))
    }, [config])

    function getUsersFromConfig(config) {
        let users = new Set()
        config.rounds.forEach(round => {
            users.add(round.userId)
        })
        return Array.from(users)
    }

    function splitInstructionsByRound(instructions) {
        if (!instructions) return {}

        let splitInstructions = {}
        instructions.forEach(instruction => {
            if (!splitInstructions[instruction.roundId]) {
                splitInstructions[instruction.roundId] = []
            }
            splitInstructions[instruction.roundId].push(instruction)
        })

        return splitInstructions
    }

    function convertSplitInstructionsToArray(splitInstructions) {
        let instructions = []
        Object.keys(splitInstructions).forEach(key => {
            splitInstructions[key].forEach(instruction => {
                instructions.push(instruction)
            })
        })
        return instructions
    }

    function handleInstructionUpdate(round, newInstructions) {
        let newActorInstructions = { ...actorInstructions }
        newActorInstructions[round] = newInstructions
        setActorInstructions(newActorInstructions)

        let updatedConfig = { ...workingConfig }
        updatedConfig.actorInstructions =
            convertSplitInstructionsToArray(newActorInstructions)
        updateWorkingConfig(updatedConfig)

        // setChangesMade(true)
    }

    function updateInstructionsOnRoundDelete(roundIdDeleted, updatedConfig) {
        //fix instruction numbers and delete any with roundIdDeleted
        let newInstructions = []
        workingConfig.actorInstructions.forEach(instruction => {
            if (instruction.roundId != roundIdDeleted) {
                if (instruction.roundId > roundIdDeleted) {
                    let updatedInstruction = { ...instruction }
                    updatedInstruction.roundId -= 1
                    newInstructions.push(updatedInstruction)
                } else {
                    newInstructions.push(instruction)
                }
            }
        })

        updatedConfig.actorInstructions = newInstructions
        updateWorkingConfig(updatedConfig)
    }

    function handleRoundUpdate(roundId, newRoundConfig) {
        let newRounds = workingConfig.rounds.flatMap(round => {
            if (round.roundId == roundId) {
                if (newRoundConfig == null) {
                    return []
                } else {
                    return [newRoundConfig]
                }
            } else {
                //maintain order in case of deletes
                console.log(round)

                if (newRoundConfig == null && roundId < round.roundId) {
                    let newRound = { ...round }
                    newRound.roundId -= 1
                    return [newRound]
                } else {
                    return [round]
                }
            }
        })

        if (roundId > rounds.length) {
            //add new round for each user
            // workingConfig.valid_uids.forEach(uid => {
                let userConfig = { ...newRoundConfig }
                userConfig.userId = 1
                newRounds.push(userConfig)
                let userConfig2 = { ...newRoundConfig }
                userConfig2.userId = 2
                newRounds.push(userConfig)
            // })
            
        }

        let updatedConfig = { ...workingConfig }
        updatedConfig.rounds = newRounds
        if (newRoundConfig == null) {
            updatedConfig = updateInstructionsOnRoundDelete(
                roundId,
                updatedConfig,
            )
        } else {
            updateWorkingConfig(updatedConfig)
        }

        // setChangesMade(true)
    }

    function collapseRounds(config) {
        //merge rounds with same roundId
        let collapsedRounds = []
        config.rounds.forEach(round => {
            let found = false
            collapsedRounds.forEach(collapsedRound => {
                if (collapsedRound.roundId == round.roundId) {
                    found = true
                }
            })
            if (!found) {
                collapsedRounds.push(round)
            }
        })

        //sort rounds by roundId
        collapsedRounds = collapsedRounds.sort((a,b)=>{
            return a.roundId-b.roundId;
        })

        console.log("HUM", collapsedRounds);

        return collapsedRounds
    }

    function updateWorkingConfig(newConfig) {
        setWorkingConfig(newConfig)
        setRounds(collapseRounds(newConfig))
        console.log(newConfig)
        setActorInstructions(
            splitInstructionsByRound(newConfig.actorInstructions),
        )

        //check if changes were made from original config
        if (JSON.stringify(newConfig) != JSON.stringify(config)) {
            setChangesMade(true)
        } else {
            setChangesMade(false)
        }
    }

    return (
        <CollapsiblePanel
            title={
                <div className='text-stone-700 w-full flex flex-row justify-between items-center mt-1'>
                    <div className='text-stone-700 text-xl'>
                        Experiment&nbsp;
                    </div>
                    <div className='text-stone-700 font-extrabold text-2xl'>
                        {code}
                    </div>
                    <div className='grow'></div>
                    {changesMade ? (
                        <div className='text-stone-700 font-normal text-md'>
                            Unsaved Changes!
                        </div>
                    ) : (
                        <div className='text-stone-700 font-normal text-md'>
                            Up to date.
                        </div>
                    )}
                    {changesMade && (
                        <button
                            className='bg-stone-300 text-white text-sm rounded-lg px-2 py-1 mx-2 '
                            onClick={e => {
                                e.stopPropagation()
                                socket.emit('updateConfig', workingConfig)
                                setChangesMade(false)
                            }}
                        >
                            Save Changes (unimplemented)
                        </button>
                    )}
                    {changesMade && (
                        <button
                            className='bg-stone-700 text-white rounded-lg px-2 py-1 ml-2 '
                            onClick={e => {
                                e.stopPropagation()
                                updateWorkingConfig(config)
                            }}
                        >
                            Discard Changes
                        </button>
                    )}
                </div>
            }
            open={false}
        >
            {/* Users */}
            <div className='text-stone-700 w-full flex flex-row mt-2'>
                <div className='font-extrabold rounded-l-lg border text-lg bg-stone-300/60 p-2'>
                    Users
                </div>
                <div className='flex flex-row bg-stone-300/30 p-2 w-full rounded-r-lg'>
                    {getUsersFromConfig(workingConfig).map((_, index) => {
                        return (
                            <img
                                key={index + '_user'}
                                className='w-8 h-8 mx-3'
                                src={userIcon}
                            ></img>
                        )
                    })}
                    <div className='w-8 h-8 text-2xl mx-3 text-center border border-black rounded group'>
                        +
                        <div className='-mt-14 p-1 bg-black text-white rounded text-sm pointer-events-none absolute z-40 w-max opacity-0 transition-opacity group-hover:opacity-100'>
                            Only a set number of 2 users are currently supported
                        </div>
                    </div>
                </div>
            </div>

            {/* Rounds */}
            <CollapsiblePanel
                title={
                    <div className='text-stone-700 w-full flex flex-row justify-between items-center mt-1'>
                        <div className='text-stone-700 text-xl font-bold'>
                            Rounds&nbsp;
                        </div>
                        <div className='grow'></div>
                        <div className='text-stone-700 text-lg'>
                            {rounds.length} Rounds
                        </div>
                    </div>
                }
                open={true}
            >
                {rounds.map((round, index) => {
                    return (
                        <RoundPanel
                            key={index + '_round'}
                            config={round}
                            onChangesMade={newConfig => {
                                handleRoundUpdate(round.roundId, newConfig)
                            }}
                        ></RoundPanel>
                    )
                })}
                <div className='w-full  flex flex-row flex-wrap'>
                    <div
                        className=' grow p-1 border-2 text-green-700 border-green-700 rounded-lg mt-2 text-center'
                        onClick={() => {
                            handleRoundUpdate(rounds.length + 1, {
                                roundId: rounds.length + 1,
                                question: '',
                                surveyLink: '',
                                layers: [],
                                time: 0,
                                targetDate: '',
                                showReview: false,
                                maxRed: 0,
                                maxGreen: 0,
                            })
                        }}
                    >
                        Add Round
                    </div>
                </div>
            </CollapsiblePanel>

            {/* Instructions */}
            <CollapsiblePanel
                title={
                    <div className='text-stone-700 w-full flex flex-row justify-between items-center mt-1'>
                        <div className='text-stone-700 text-xl font-bold'>
                            Actor Instructions&nbsp;
                        </div>
                        <div className='grow'></div>
                        <div className='text-stone-700 text-lg'>
                            {workingConfig.actorInstructions
                                ? workingConfig.actorInstructions.length
                                : 0}{' '}
                            Instructions
                        </div>
                    </div>
                }
                open={true}
            >
                {rounds.map(round => {
                    return (
                        <ActorInstructionsPanel
                            key={round.roundId + '_instructions'}
                            instructions={
                                actorInstructions[round.roundId]
                                    ? actorInstructions[round.roundId]
                                    : []
                            }
                            roundId={round.roundId}
                            onUpdateInstructions={newInstructions => {
                                handleInstructionUpdate(
                                    round.roundId,
                                    newInstructions,
                                )
                            }}
                        ></ActorInstructionsPanel>
                    )
                })}
            </CollapsiblePanel>
        </CollapsiblePanel>
    )
}

// function UsersPanel()

// function A

function RoundPanel({ config, onChangesMade }) {
    // useEffect(() => {}, [config]) //

    function handleChange(name, value) {
        let newConfig = { ...config }
        newConfig[name] = value
        console.log(newConfig)
        console.log(config)
        onChangesMade(newConfig)
    }

    return (
        <div className='w-full my-3'>
            <CollapsiblePanel
                title={
                    <div className='text-stone-700 w-full flex flex-row mt-1'>
                        <div className='text-stone-700 text-lg font-bold mr-2'>
                            Round {config.roundId}
                        </div>

                        <div className='grow'></div>
                        {/* {changesMade && (
                            <div className='text-orange-600 font-normal mx-1 text-sm'>
                                Unsaved Changes!
                            </div>
                        )} */}
                        <div className='text-stone-400 text-sm mx-1'>
                            {config.question}
                        </div>
                        <div className='text-stone-400 text-sm  mx-2'>
                            {config.time}s
                        </div>
                        <div className='text-stone-400 text-sm  mx-1'>
                            {config.targetDate}
                        </div>
                    </div>
                }
                open={false}
            >
                <div className='flex flex-row p-2 w-full'>
                    <div className='font-extrabold rounded-l-lg b-2 text-md bg-stone-300 p-2'>
                        Question
                    </div>
                    <input
                        type='text'
                        className=' p-2 w-full rounded-r-lg text-center'
                        value={config.question}
                        onChange={e => {
                            handleChange('question', e.target.value)
                        }}
                    ></input>
                </div>
                <div className='flex flex-row p-2 w-full'>
                    <div className='font-extrabold w-max rounded-l-lg b-2 text-md bg-stone-300 p-2 whitespace-nowrap'>
                        Survey Link
                    </div>
                    <input
                        type='text'
                        className='p-2 w-full rounded-r-lg text-center'
                        value={config.surveyLink}
                        onChange={e => {
                            handleChange('surveyLink', e.target.value)
                        }}
                    ></input>
                </div>
                <LayerSelector
                    layers={config.layers}
                    onChangeLayers={layers => {
                        handleChange('layers', layers)
                    }}
                ></LayerSelector>
                <div className='w-full flex flex-row flex-wrap'>
                    <div className='flex flex-row p-2'>
                        <div className='w-max font-extrabold rounded-l-lg b-2 text-md bg-stone-300 p-2'>
                            Time{' '}
                            <span className='font-normal text-sm'>(s)</span>
                        </div>
                        <input
                            type='number'
                            className='h-full p-2 rounded-r-lg text-center'
                            value={config.time}
                            onChange={e => {
                                handleChange('time', e.target.value)
                            }}
                        ></input>
                    </div>
                    <div className='flex flex-row p-2'>
                        <div className='font-extrabold rounded-l-lg b-2 text-md bg-stone-300 p-2'>
                            Date
                        </div>
                        <input
                            type='date'
                            className='h-full p-2 rounded-r-lg text-center'
                            value={config.targetDate}
                            onChange={e => {
                                handleChange('targetDate', e.target.value)
                            }}
                        ></input>
                    </div>
                    <div className='flex flex-row p-2'>
                        <div className='font-extrabold rounded-l-lg b-2 text-md bg-stone-300 p-2'>
                            Review Enabled?
                        </div>
                        <div
                            className='h-full p-2 px-4 rounded-r-lg text-center bg-white cursor-pointer'
                            onClick={() => {
                                handleChange('showReview', !config.showReview)
                            }}
                        >
                            {config.showReview ? 'Yes' : 'No'}
                            <span className='opacity-50 text-xs ml-2'>
                                click/tap
                            </span>
                        </div>
                    </div>
                    <div className='flex flex-row p-2'>
                        <div className='font-extrabold rounded-l-lg b-2 text-md bg-stone-300 p-2'>
                            Pin Count
                        </div>
                        <div className='rounded-r-lg bg-white b-2 text-md  flex flex-row'>
                            <img
                                src={redPinIcon}
                                className='h-8 mt-1 ml-4'
                            ></img>
                            <input
                                type='number'
                                className='h-8 mt-1 w-10 text-center font-bold text-red-700'
                                value={config.maxRed}
                                onChange={e => {
                                    handleChange('maxRed', e.target.value)
                                }}
                            ></input>
                            <img src={greenPinIcon} className='h-8 mt-1'></img>
                            <input
                                type='number'
                                className='h-8 mt-1 w-10 text-center font-bold text-green-700'
                                value={config.maxGreen}
                                onChange={e => {
                                    handleChange('maxGreen', e.target.value)
                                }}
                            ></input>
                        </div>
                    </div>
                    <div
                        className='flex flex-row p-2 my-2 border b-2 border-red-600 text-red-600 font-extrabold rounded-lg'
                        onClick={() => {
                            if (
                                window.confirm(
                                    'Are you sure you want to delete this round?',
                                )
                            ) {
                                onChangesMade(null)
                            }
                        }}
                    >
                        Delete Round
                    </div>
                </div>
            </CollapsiblePanel>
        </div>
    )
}

//Combine the instructions into rounds and then display them
function ActorInstructionsPanel({
    roundId,
    instructions,
    onUpdateInstructions,
}) {
    // let [changesMade, setChangesMade] = useState(false)

    function handleInstructionUpdate(index, newInstruction) {
        let newInstructions = [...instructions]
        if (newInstruction == null) {
            newInstructions.splice(index, 1)
        } else {
            newInstructions[index] = newInstruction
        }
        onUpdateInstructions(newInstructions)
    }

    function handleAddInstruction() {
        let newInstructions = [...instructions]
        newInstructions.push({
            roundId: roundId,
            message: '',
            time: 0,
            color: 'Green',
            lat: 0,
            lon: 0,
        })
        onUpdateInstructions(newInstructions)
    }

    return (
        <CollapsiblePanel
            title={
                <div className='text-stone-700 w-full flex flex-row justify-between items-center mt-1'>
                    <div className='text-stone-700 text-lg font-bold'>
                        Round {roundId}
                    </div>
                    <div className='grow'></div>
                    <div className='text-stone-400 text-md'>
                        {instructions.length} Instructions
                    </div>
                </div>
            }
            open={false}
        >
            {instructions.map((instruction, index) => {
                return (
                    <InstructionPanel
                        key={index + '_instruction'}
                        instruction={instruction}
                        onUpdateInstruction={updatedInstruction => {
                            handleInstructionUpdate(index, updatedInstruction)
                        }}
                    ></InstructionPanel>
                )
            })}
            <div className='w-full  flex flex-row flex-wrap'>
                <div className='grow'></div>
                <div
                    className='p-2 border-2 text-green-700 border-green-700 rounded-xl mt-2 text-center'
                    onClick={() => {
                        handleAddInstruction()
                    }}
                >
                    Add Instruction
                </div>
            </div>
        </CollapsiblePanel>
    )
}

function InstructionPanel({ instruction, onUpdateInstruction }) {
    // let [workingInstruction, setWorkingInstruction] = useState(instruction)
    // let [changesMade, setChangesMade] = useState(false)

    function handleChange(name, value) {
        let newInstruction = { ...instruction }
        newInstruction[name] = value
        onUpdateInstruction(newInstruction)
    }

    return (
        <div className='w-full p-2 border-2 border-stone-400 rounded-xl m-2 my-3'>
            <div className='w-full flex flex-row mb-2'>
                <div className='font-extrabold w-max rounded-l-lg b-2 text-md bg-stone-300 p-2 whitespace-nowrap'>
                    Message
                </div>
                <textarea
                    className='w-full rounded-r-lg text-center'
                    value={instruction.message}
                    onChange={e => {
                        handleChange('message', e.target.value)
                    }}
                ></textarea>
            </div>
            <div className='grid xl:grid-cols-5 grid-cols-1 gap-x-1'>
                <div className='flex flex-row grow'>
                    <div className='font-extrabold w-max rounded-l-lg b-2 text-md bg-stone-300 p-2 whitespace-nowrap'>
                        Time
                    </div>
                    <input
                        type='number'
                        className='h-full p-2 rounded-r-lg text-center w-full'
                        value={instruction.time}
                        onChange={e => {
                            handleChange('time', e.target.value)
                        }}
                    ></input>
                </div>
                <div className='flex flex-row grow'>
                    <div className='font-extrabold w-max rounded-l-lg b-2 text-md bg-stone-300 p-2 whitespace-nowrap'>
                        Color
                    </div>
                    {/* TODO: make custom */}
                    <input
                        type='text'
                        className='h-full p-2 text-center rounded-r-lg w-full'
                        value={instruction.color}
                        onChange={e => {
                            handleChange('color', e.target.value)
                        }}
                    ></input>
                </div>
                <div className='flex flex-row grow'>
                    <div className='font-extrabold w-max rounded-l-lg b-2 text-md bg-stone-300 p-2 whitespace-nowrap'>
                        Latitude
                    </div>
                    <input
                        type='number'
                        className='h-full p-2 rounded-r-lg text-center w-full'
                        value={instruction.lat}
                        onChange={e => {
                            handleChange('lat', e.target.value)
                        }}
                    ></input>
                </div>
                <div className='flex flex-row grow'>
                    <div className='font-extrabold w-max rounded-l-lg b-2 text-md bg-stone-300 p-2 whitespace-nowrap'>
                        Longitude
                    </div>
                    <input
                        type='number'
                        className='h-full p-2 rounded-r-lg text-center w-full'
                        value={instruction.lon}
                        onChange={e => {
                            handleChange('lon', e.target.value)
                        }}
                    ></input>
                </div>
                <div className='flex flex-row grow'>
                    <div
                        className=' text-center w-full rounded-lg b-2 text-md border b-2 border-red-600 text-red-600 p-2 whitespace-nowrap'
                        onClick={() => {
                            //confirm with alert
                            if (
                                window.confirm(
                                    'Are you sure you want to delete this instruction?',
                                )
                            ) {
                                onUpdateInstruction(null)
                            }
                        }}
                    >
                        Remove Instruction
                    </div>
                </div>
            </div>
        </div>
    )
}

// Chooses which layers to enable on the map
function LayerSelector({ layers, onChangeLayers }) {
    // let [workingLayers, setWorkingLayers] = useState(layers)

    return (
        <div className='flex flex-row p-2 w-full'>
            <div className='font-extrabold w-max rounded-l-lg b-2 text-md bg-stone-300 p-2 whitespace-nowrap'>
                Layers Enabled
            </div>
            <div className='flex flex-row rounded-r-lg justify-center align-middle bg-white b-2 text-md w-full'>
                {offenses.map((offense, index) => {
                    return (
                        <div
                            key={index + '_layer'}
                            className={
                                'h-full m-0.5 text-center cursor-pointer group'
                            }
                            onClick={() => {
                                //if layer in arr, remove
                                //else add

                                let newLayers = [...layers]
                                if (layers.includes(offense)) {
                                    //remove value "offense" from array
                                    newLayers.splice(
                                        newLayers.indexOf(offense),
                                        1,
                                    )
                                } else {
                                    newLayers.push(offense)
                                }
                                onChangeLayers(newLayers)
                            }}
                        >
                            <img
                                src={offenseToIcon[offense]}
                                className={
                                    'w-8 h-8 ' +
                                    (layers.includes(offense)
                                        ? 'saturate-100 opacity-100'
                                        : 'saturate-50 opacity-25')
                                }
                            ></img>
                            <div className='-mt-16 p-1 bg-black text-white rounded text-sm pointer-events-none absolute z-40 w-max opacity-0 transition-opacity group-hover:opacity-100'>
                                {offensesToReadable[offense]}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
