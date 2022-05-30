
import React from 'react';
import ReactDOM from 'react-dom';
import { io } from "socket.io-client";
import { DateRange } from 'react-date-range';
import {useState} from 'react'
import 'react-date-range/dist/styles.css'; // main style file
import '../assets/css/cal.css'; // theme css file
import { CrimeMap, Pin } from "./map";
import {offenses, offenseToIcon, offensesToReadable} from "./crimes"

//Import images
const socket = io('/crime');

var liveSocket;
var crimesListGlobal = [];
var startGlobal;
var endGlobal;
var blockedDate;

socket.on('connect', ()=>{
    console.log("Connected to " + socket.nsp);
});


function CrimeSelect({crimeName, toggleCrime}){
    const [on, toggleOn] = useState(false);

    return <div>
        <label className={"cursor-pointer text-stone-600"} onClick={
        ()=>{toggleOn(!on); toggleCrime(!on);}
     }>
            <div className="flex flex-row" >

            {/* <input 
            type="checkbox"
            className="chk"
            value={on}
            onChange={()=>{toggleOn(!on); toggleCrime(!on);}}
            ></input> */}
            <img
             
             src={offenseToIcon[crimeName]}
             className={"max-h-8 " + (!on ? "brightness-0 opacity-50" : "")}            
            >
            </img>
            <div className={"font-bold pl-2 " + (!on ? "line-through text-stone-400" : "text-stone-700")}>{offensesToReadable[crimeName]}</div>
            </div>
        </label>
    </div>
}


function CrimeTypePicker({crimeList, updateCrimeList}){
    const [crimesSelected, updateCrimesSelected] = useState([]);

    return <div className="p-4">
        {crimeList.map((crime) => {
            return <CrimeSelect
            key={crime}
            crimeName={crime}
            toggleCrime={(val)=>{
                if(val && !crimesSelected.includes(crime)){
                    updateCrimesSelected([...crimesSelected, crime]);
                    updateCrimeList([...crimesSelected, crime]);
                }else if(crimesSelected.includes(crime)){
                    updateCrimesSelected(crimesSelected.filter((val) => {
                        return val !== crime
                    }));
                    updateCrimeList(crimesSelected.filter((val) => {
                        return val !== crime
                    }));
                }
            }}
            >
            </CrimeSelect>
        })
        }

    </div>
}

function getStartEnd(){
    return fetch('/trust/crime/requestStartEnd').then(
        response=>response.json()
    ).then(respJson => {
        return respJson;
    }).catch((error) => {
        console.log(error)
    })
}



function getPins(start, end, categories) {
    
    return fetch('/trust/crime/requestPins', {
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            startDate: dateToString(start),
            endDate: dateToString(end),
            categories: categories
        }),
        method: 'POST'
    }).then(response => {return response.json();}).then((respJson) => {
        return respJson;



    }).catch((err) => {
        console.log(err);
    });
}


function rerenderMapView(start, end, categories){
    // console.log(start, end);
    getPins(new Date(start), new Date(end), categories).then(crimesJson => {
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
            <StatView
            number={pins.length}
            max={crimesJson.maxResults}></StatView>,
            document.getElementById("stat")
        )
        ReactDOM.render(
            <CrimeMap pins={pins}></CrimeMap>,
            document.getElementById("map")
        );
    })
}

function DatePicker({min, max, startEnd, blockedDate, changeCallback}){
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
            ranges={state}
            disabledDates={[blockedDate]}
            onChange={(item)=>{
                setState([item.selection]);
                startGlobal = item.selection.startDate;
                endGlobal = item.selection.endDate;
                changeCallback(item.selection.startDate, item.selection.endDate, crimesListGlobal);
            }}
        
        className="bg-stone-300 rounded-xl"></DateRange>
        <div className="flex-grow"></div>
    </div>
}

function dateToString(date){
    return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDate().toString().padStart(2, '0'));
}

function StatView({number, max}){
    let randSamp = number == 200;

    console.log(randSamp);

    return (!randSamp ? <div>
        Showing {number} results.
        {blockedDate}

    </div> 
    : 
    <div>
        Showing {number} random results out of {max}.
        {blockedDate}
    </div>)
}




function renderCrimeView(){
    ReactDOM.render(
        <StatView
        number={0}
        max={0}></StatView>,
        document.getElementById("stat")
    )

    ReactDOM.render(
        <CrimeTypePicker
            crimeList={[]}
            updateCrimeList={(list)=>{crimesListGlobal=list; rerenderMapView(startGlobal, endGlobal, list);}}
        >
        </CrimeTypePicker>,
        document.getElementById("filter")
    );

    getStartEnd().then(response=>{
        liveSocket = io('/live' + response.code);

        liveSocket.on('connect', ()=>{
            console.log("Connected to " + liveSocket.nsp);
            liveSocket.emit('crimeLiveConfig', {userId: response.userId});
        });

        liveSocket.on('liveCfg', (data) => {
            console.log("WOW GOT A RESPONSE");
            console.log(data);
            blockedDate = data.curDate;
            ReactDOM.render(
                <DatePicker
                    min={new Date(response.startDate)}
                    max={new Date(response.endDate)}
                    blockedDate={new Date(blockedDate)}
                    startEnd={startPlusOne}
                    changeCallback={rerenderMapView}
                ></DatePicker>,
                document.getElementById("datepicker")
            );
            ReactDOM.render(
                <CrimeTypePicker
                    crimeList={data.categories}
                    updateCrimeList={(list)=>{crimesListGlobal=list; rerenderMapView(startGlobal, endGlobal, list);}}
                >
                </CrimeTypePicker>,
                document.getElementById("filter")
            );
        })

        let startPlusOne = new Date(response.startDate);
        startPlusOne.setDate(startPlusOne.getDate() + 1);
        startGlobal = new Date(response.startDate);
        endGlobal = startPlusOne;
        ReactDOM.render(
            <DatePicker
                min={new Date(response.startDate)}
                max={new Date(response.endDate)}
                startEnd={startPlusOne}
                changeCallback={rerenderMapView}
            ></DatePicker>,
            document.getElementById("datepicker")
        );
        
        // getPins(new Date(response.startDate), startPlusOne).then((crimesJson) => {
        //     let pins = crimesJson.dates.map((crime) => {
        //         return <Pin 
        //         key={crime.index} 
        //         lat={crime.geoLat} 
        //         lon={crime.geoLon} 
        //         green={!crime.isCrime}
        //         date={crime.firstOccuranceDate}
        //         offense={crime.offsenseCategoryId}
        //         address={crime.incidentAddress}
        //         >
        //         </Pin>
        //     });

        ReactDOM.render(
            <CrimeMap pins={[]}></CrimeMap>,
            document.getElementById("map")
        );
        // })

        
    })

   
}
renderCrimeView();