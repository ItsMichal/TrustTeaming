import React from 'react'
import { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { io } from 'socket.io-client'
import { DateRange } from 'react-date-range'
import { useState } from 'react'
import 'react-date-range/dist/styles.css' // main style file
import '../assets/css/cal.css' // theme css file
import '../assets/css/global.css' //global tailwind theme
import { CrimeMap, CrimePin } from './map'
import { offenseToIcon, offensesToReadable, offenseToColor } from './crimes'
//Import images
const socket = io('/crime')

var liveSocket
var crimesListGlobal = []
var startGlobal
var endGlobal
var blockedDate

const mapRenderer = createRoot(document.getElementById('map'))
const datePickerRenderer = createRoot(document.getElementById('datepicker'))
const statRenderer = createRoot(document.getElementById('stat'))
const filterRenderer = createRoot(document.getElementById('filter'))

socket.on('connect', () => {
    console.log('Connected to ' + socket.nsp)
})

function CrimeSelect({ crimeName, toggleCrime }) {
    const [on, toggleOn] = useState(false)

    return (
        <div>
            <label
                className={'cursor-pointer text-stone-600'}
                onClick={() => {
                    toggleOn(!on)
                    toggleCrime(!on)
                }}
            >
                <div className='flex flex-row'>
                    {/* <input 
            type="checkbox"
            className="chk"
            value={on}
            onChange={()=>{toggleOn(!on); toggleCrime(!on);}}
            ></input> */}
                    <img
                        src={offenseToIcon[crimeName]}
                        className={
                            'max-h-8 ' + (!on ? 'brightness-0 opacity-50' : '')
                        }
                    ></img>
                    <div
                        className={
                            'font-bold pl-2 ' +
                            (!on
                                ? 'line-through text-stone-400'
                                : 'text-stone-700')
                        }
                    >
                        {offensesToReadable[crimeName]}
                    </div>
                </div>
            </label>
        </div>
    )
}

function CrimeTypePicker({ crimeList, updateCrimeList }) {
    const [crimesSelected, updateCrimesSelected] = useState([])

    return (
        <div className='p-4'>
            {crimeList.map(crime => {
                return (
                    <CrimeSelect
                        key={crime}
                        crimeName={crime}
                        toggleCrime={val => {
                            if (val && !crimesSelected.includes(crime)) {
                                updateCrimesSelected([...crimesSelected, crime])
                                updateCrimeList([...crimesSelected, crime])
                            } else if (crimesSelected.includes(crime)) {
                                updateCrimesSelected(
                                    crimesSelected.filter(val => {
                                        return val !== crime
                                    }),
                                )
                                updateCrimeList(
                                    crimesSelected.filter(val => {
                                        return val !== crime
                                    }),
                                )
                            }
                        }}
                    ></CrimeSelect>
                )
            })}
        </div>
    )
}

function getStartEnd() {
    return fetch('/trust/crime/requestStartEnd')
        .then(response => response.json())
        .then(respJson => {
            return respJson
        })
        .catch(error => {
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
            categories: categories,
        }),
        method: 'POST',
    })
        .then(response => {
            return response.json()
        })
        .then(respJson => {
            return respJson
        })
        .catch(err => {
            console.log(err)
        })
}

function rerenderMapView(start, end, categories) {
    // console.log(start, end);
    getPins(new Date(start), new Date(end), categories).then(crimesJson => {
        console.log(crimesJson)
        let pins = crimesJson.dates.map(crime => {
            return CrimePin({
                key: crime.index,
                lat: crime.geoLat,
                lon: crime.geoLon,
                green: offenseToColor[crime.offsenseCategoryId],
                date: crime.firstOccuranceDate,
                offense: crime.offsenseCategoryId,
                address: crime.incidentAddress,
            })
        })
        statRenderer.render(
            <StatView
                number={pins.length}
                max={crimesJson.maxResults}
            ></StatView>,
        )
        mapRenderer.render(<CrimeMap pins={pins}></CrimeMap>)
    })
}

//Generate an array of 365 (sometimes 366 ;)) dates
//that we block off depending on the target date.
//probably the cleanest solution to block off an entire year
//from being seen (client-side)
function blockedYearDates(year) {
    //strategy: get Jan 1, then increment+push until no longer same year
    //ref: https://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates

    var dateArr = []
    var curDate = new Date(year + '-01-01T00:00:00')

    while (curDate.getFullYear() == year) {
        dateArr.push(curDate)
        var nextDate = new Date(curDate.valueOf())
        nextDate.setDate(nextDate.getDate() + 1)
        curDate = nextDate
    }

    return dateArr
}

function DatePicker({ min, max, startEnd, blockedDate, changeCallback }) {
    const [state, setState] = useState([
        {
            startDate: min,
            endDate: startEnd,
            key: 'selection',
        },
    ])

    const blockedDates = useMemo(() => {
        if(blockedDate) return blockedYearDates(blockedDate.getFullYear())
        return [];
    }, [blockedDate])

    return (
        <>
            <div className='flex flex-row'>
                <div className='flex-grow'></div>
                <DateRange
                    minDate={min}
                    maxDate={max}
                    shownDate={min}
                    ranges={state}
                    disabledDates={blockedDates}
                    onChange={item => {
                        setState([item.selection])
                        startGlobal = item.selection.startDate
                        endGlobal = item.selection.endDate
                        changeCallback(
                            item.selection.startDate,
                            item.selection.endDate,
                            crimesListGlobal,
                        )
                    }}
                    className='bg-stone-300 rounded-xl'
                ></DateRange>
                <div className='flex-grow'></div>
            </div>
            {blockedDate && (
                <div className='w-full text-center'>
                    <b>Warning:</b> {blockedDate.getFullYear()} dates are now
                    unavailable.
                </div>
            )}
        </>
    )
}

function dateToString(date) {
    return (
        date.getFullYear() +
        '-' +
        (date.getMonth() + 1) +
        '-' +
        date.getDate().toString().padStart(2, '0')
    )
}

function StatView({ number, max }) {
    let randSamp = number == 500

    console.log(randSamp)

    return !randSamp ? (
        <div>Showing {number} results.</div>
    ) : (
        <div>
            Showing {number} random results out of {max}.
        </div>
    )
}

function renderCrimeView() {
    statRenderer.render(<StatView number={0} max={0}></StatView>)

    filterRenderer.render(
        <CrimeTypePicker
            crimeList={[]}
            updateCrimeList={list => {
                crimesListGlobal = list
                rerenderMapView(startGlobal, endGlobal, list)
            }}
        ></CrimeTypePicker>,
    )

    getStartEnd().then(response => {
        liveSocket = io('/live' + response.code)

        liveSocket.on('connect', () => {
            console.log('Connected to ' + liveSocket.nsp)
            liveSocket.emit('crimeLiveConfig', { userId: response.userId })
        })

        liveSocket.on('liveCfg', data => {
            //Check if data pertains to us
            //TODO: Should be done on server for proper "security"
            if (data.userId != response.userId) {
                return
            }

            //Update the date picker
            //TODO: Standardize time so the append for local tmz isnt necessary
            blockedDate = data.curDate
            datePickerRenderer.render(
                <DatePicker
                    min={new Date(response.startDate)}
                    max={new Date(response.endDate)}
                    blockedDate={new Date(blockedDate + 'T00:00:00')}
                    startEnd={startPlusOne}
                    changeCallback={rerenderMapView}
                ></DatePicker>,
            )

            //Update the crime type picker
            filterRenderer.render(
                <CrimeTypePicker
                    crimeList={data.categories}
                    updateCrimeList={list => {
                        crimesListGlobal = list
                        rerenderMapView(startGlobal, endGlobal, list)
                    }}
                ></CrimeTypePicker>,
            )
        })

        let startPlusOne = new Date(response.startDate)
        startPlusOne.setDate(startPlusOne.getDate() + 1)
        startGlobal = new Date(response.startDate)
        endGlobal = startPlusOne
        datePickerRenderer.render(
            <DatePicker
                min={new Date(response.startDate)}
                max={new Date(response.endDate)}
                startEnd={startPlusOne}
                changeCallback={rerenderMapView}
            ></DatePicker>,
        )

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

        mapRenderer.render(<CrimeMap pins={[]}></CrimeMap>)
        // })
    })
}
renderCrimeView()
