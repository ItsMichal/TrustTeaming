// Creates an element that allows a user to create an experiment configuration, and edit rounds
// as well as download the config as a csv. Also allows the user to directly edit a live config.

import React from 'react'
import ReactDOM from 'react-dom'
import { io } from 'socket.io-client'
import { DateRange } from 'react-date-range'
import { useState } from 'react'
import 'react-date-range/dist/styles.css' // main style file
import '../assets/css/cal.css' // theme css file
import '../assets/css/global.css' //global tailwind theme

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

function ConfigPanel({ configs }) {}
