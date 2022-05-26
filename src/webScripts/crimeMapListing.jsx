
import React from 'react';
import ReactDOM from 'react-dom';
import { io } from "socket.io-client";
import { DateRange } from 'react-date-range';
import {useState} from 'react'
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { CrimeMap, Pin } from "./map";

//Import images


const socket = io('/crime');

socket.on('connect', ()=>{
    console.log("Connected to " + socket.nsp);
});

function getStartEnd(){
    return fetch('/trust/crime/requestStartEnd').then(
        response=>response.json()
    ).then(respJson => {
        return respJson;
    }).catch((error) => {
        console.log(error)
    })
}



function getPins(start, end) {
    
    return fetch('/trust/crime/requestPins', {
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            startDate: dateToString(start),
            endDate: dateToString(end)
        }),
        method: 'POST'
    }).then(response => {return response.json();}).then((respJson) => {
        return respJson;



    }).catch((err) => {
        console.log(err);
    });
}


function rerenderMapView(start, end){
    // console.log(start, end);
    getPins(new Date(start), new Date(end)).then(crimesJson => {
        console.log(crimesJson);
        let pins = crimesJson.dates.map((crime) => {
            return <Pin 
            key={crime.index} 
            lat={crime.geoLat} 
            lon={crime.geoLon} 
            green={!crime.isCrime}
            date={crime.firstOccuranceDate}
            offense={crime.offsenseCategoryId}
            address={crime.incidentAddress}
            >
            </Pin>
        });
        ReactDOM.render(
            <CrimeMap pins={pins}></CrimeMap>,
            document.getElementById("map")
        );
    })
}

function DatePicker({min, max, startEnd, changeCallback}){
    const [state, setState] = useState([
        {
        startDate: min,
        endDate: startEnd,
        key: 'selection'
        }
    ]);

    return <div className="flex flex-row">
        <div className="flex-grow"></div>
        <DateRange
            minDate={min}
            maxDate={max}
            shownDate={min}
            editableDateInputs={true}
            ranges={state}
            onChange={(item)=>{
                setState([item.selection]);
                changeCallback(item.selection.startDate, item.selection.endDate);
            }}
        
        className="bg-gray-300 rounded-xl"></DateRange>
        <div className="flex-grow"></div>
    </div>
}

function dateToString(date){
    return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDate().toString().padStart(2, '0'));
}



function renderCrimeView(){
    getStartEnd().then(response=>{
        console.log(response);
        let startPlusOne = new Date(response.startDate);
        startPlusOne.setDate(startPlusOne.getDate() + 1);
        ReactDOM.render(
            <DatePicker
                min={new Date(response.startDate)}
                max={new Date(response.endDate)}
                startEnd={startPlusOne}
                changeCallback={rerenderMapView}
            ></DatePicker>,
            document.getElementById("datepicker")
        );
        
        getPins(new Date(response.startDate), startPlusOne).then((crimesJson) => {
            let pins = crimesJson.dates.map((crime) => {
                return <Pin 
                key={crime.index} 
                lat={crime.geoLat} 
                lon={crime.geoLon} 
                green={!crime.isCrime}
                date={crime.firstOccuranceDate}
                offense={crime.offsenseCategoryId}
                address={crime.incidentAddress}
                >
                </Pin>
            });

            ReactDOM.render(
                <CrimeMap pins={pins}></CrimeMap>,
                document.getElementById("map")
            );
        })

        
    })

   
}
renderCrimeView();