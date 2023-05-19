/* eslint-disable no-undef */
import React, { useRef, useState } from 'react'
import {
    Circle,
    FeatureGroup,
    MapContainer,
    Marker,
    TileLayer,
    Tooltip,
    useMap,
    useMapEvent,
} from 'react-leaflet'
import 'leaflet'
import greenIcon from '../assets/img/green.png'
import redIcon from '../assets/img/red.png'
import aiGreenIcon from '../assets/img/icons/ai_green.png'
import aiRedIcon from '../assets/img/icons/ai_red.png'
import shadow from '../assets/img/shadow.png'
import aiIcon from '../assets/img/user_icons/ai_icon.png'
import userOneIcon from '../assets/img/user_icons/user_one.png'
import userTwoIcon from '../assets/img/user_icons/user_two.png'
import userIcon from '../assets/img/user_icons/user_icon.png'
import { offenseToIcon, offensesToReadable } from './crimes'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import '../assets/css/marker.css'
// import 'leaflet.markercluster/dist/MarkerCluster.css'

export function BaseMap({ PinGroup, children }) {
    return (
        <MapContainer
            center={[39.7392, -104.9903]}
            zoom={13}
            maxZoom={18}
            className={'w-full h-full'}
        >
            {PinGroup}
            {children}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
        </MapContainer>
    )
}

export function CrimePin({ lat, lon, green, offense, date, address }) {
    let iconUrl
    let iconSize

    if (offense != undefined) {
        if (Object.prototype.hasOwnProperty.call(offenseToIcon, offense)) {
            iconUrl = offenseToIcon[offense]
        } else {
            iconUrl = redIcon
        }
        iconSize = [30, 30]
    } else {
        if (green) {
            iconUrl = greenIcon
        } else {
            iconUrl = redIcon
        }
        iconSize = [25, 41]
    }

    let thisMarker = new L.Marker([lat, lon], {
        icon: new L.Icon({
            iconUrl: iconUrl,
            shadow: shadow,
            iconSize: iconSize,
            iconAnchor: [14, 14],
            // iconAnchor: [12, 41],
            // popupAnchor: [1, -34],
            shadowSize: [41, 41],
            // className: iconUrl
            className: green + '_type',
        }),
    }).bindPopup(
        `<div>
        <h1 className="font-bold text-lg">${offensesToReadable[offense]}</h1>
        <h2 className="font-semibold">${address}</h2>
        ${date}
        </div>`,
    )

    let cirlceMarker = new L.Circle([lat, lon], {
        radius: 500,
        opacity: 0.15,
        fillOpacity: 0.15,

        color:
            green == 'green'
                ? '#4abd59'
                : green == 'red'
                ? '#bd4a4a'
                : '#949494',
        fillColor:
            green == 'green'
                ? '#4abd59'
                : green == 'red'
                ? '#bd4a4a'
                : '#949494',
    })

    return [thisMarker, cirlceMarker]
}

/**
 * Handles the crime map pins
 * @param pins List of crime pins to display.
 * @returns
 */
export function CrimeMarkerGroup({ pins }) {
    const map = useMap()

    const layerGroup = useRef(new L.LayerGroup([]))

    layerGroup.current.clearLayers()

    if (!map.hasLayer(layerGroup.current)) {
        map.addLayer(layerGroup.current)
    }

    return (
        <>
            {pins.map(pin => {
                layerGroup.current.addLayer(pin[0])
                layerGroup.current.addLayer(pin[1])
            })}
        </>
    )
}

export function ReviewMarkerGroup({ pins, crimePins }) {
    console.log(crimePins)
    return (
        <>
            <CrimeMarkerGroup pins={crimePins} />
            {Object.values(pins).map(pin => {
                return (
                    <StaticPin
                        key={pin.pinId}
                        pinId={pin.pinId + '_pin'}
                        lat={pin.lat}
                        lon={pin.lon}
                        color={pin.color}
                        {...pin}
                    />
                )
            })}
        </>
    )
}

//For debugging
export function StaticPin({
    pinId,
    lat,
    lon,
    userMoved,
    userPlaced,
    timePlaced,
    aiPlaced,
    message = '',
    color,
}) {
    // const [pos, setPos] = useState({lat:lat, lng:lon});
    let iconURLToUse = color == 'green' ? greenIcon : redIcon
    if (aiPlaced) {
        iconURLToUse = color == 'green' ? aiGreenIcon : aiRedIcon
    }
    let icon = new L.Icon({
        iconUrl: iconURLToUse,
        shadow: shadow,
        iconSize: aiPlaced ? [25, 61] : [25, 41],
        iconAnchor: aiPlaced ? [13, 59] : [13, 39],
        // iconAnchor: [12, 41],
        // popupAnchor: [1, -34],
        shadowSize: [41, 41],
        // className: iconUrl
        className: color + '_type',
    })

    return (
        <FeatureGroup>
            <Marker
                key={pinId + '_pin'}
                pinId={pinId}
                position={[lat, lon]}
                icon={icon}
            >
                <SharedPopup
                    pinId={pinId}
                    userMoved={userMoved}
                    userPlaced={userPlaced}
                    aiPlaced={aiPlaced}
                    timePlaced={timePlaced}
                    message={message}
                />
            </Marker>
            <Circle
                key={pinId + '_pinCircle'}
                center={[lat, lon]}
                fillOpacity={0.4}
                radius={500}
                color={color == 'green' ? '#4abd59' : '#bd4a4a'}
                fillColor={color == 'green' ? '#4abd59' : '#bd4a4a'}
            ></Circle>
        </FeatureGroup>
    )
}

export function SharedPopup({
    pinId,
    userMoved,
    userPlaced,
    aiPlaced,
    timePlaced,
    message = '',
}) {
    let tmzDate = new Date(timePlaced + 'UTC')
    let fmtTimeplaced = tmzDate.toLocaleTimeString()
    let timeSincePlaced = Math.floor((Date.now() - tmzDate) / 1000 / 60)
    let timeSincePlacedSeconds = Math.floor(
        ((Date.now() - tmzDate) / 1000) % 60,
    )
    let [seconds, setSeconds] = useState(timeSincePlaced)
    let [minutes, setMinutes] = useState(timeSincePlacedSeconds)
    const [forcePopup, setForcePopup] = useState(
        aiPlaced && seconds < 5 && minutes < 1,
    )
    // let tooltipShowing= false;

    React.useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(Math.floor(((Date.now() - tmzDate) / 1000) % 60))
            setMinutes(Math.floor((Date.now() - tmzDate) / 1000 / 60))
            if ((seconds > 5 || minutes > 1) && forcePopup) {
                setForcePopup(false)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [forcePopup, minutes, seconds, tmzDate])

    function UserIconPopup({ userId }) {
        function IconImg({ iconToDisplay }) {
            return <img className='w-8 h-8 rounded-full' src={iconToDisplay} />
        }

        if (userId.toLowerCase() == 'ai') {
            return (
                <div className='w-full flex flex-row items-center justify-center'>
                    <IconImg iconToDisplay={aiIcon} />
                </div>
            )
        } else if (userId.toLowerCase() == '1') {
            return (
                <div className='w-full flex flex-row items-center justify-center'>
                    <IconImg iconToDisplay={userOneIcon} />
                </div>
            )
        } else if (userId.toLowerCase() == '2') {
            return (
                <div className='w-full flex flex-row items-center justify-center'>
                    <IconImg iconToDisplay={userTwoIcon} />
                </div>
            )
        } else {
            return (
                <div className='w-full flex flex-row items-center justify-center'>
                    <IconImg iconToDisplay={userIcon} />
                </div>
            )
        }
    }

    function InnerTooltip() {
        return (
            <div className='p-2 w-fit'>
                <h3 className='text-center font-bold text-lg'>Pin {pinId}</h3>
                {aiPlaced && (
                    <p className='text-center text-sm'>
                        Placed by AI - Permanent
                    </p>
                )}
                <hr className='m-2'></hr>

                {aiPlaced && (
                    <>
                        <div className='w-lg whitespace-normal'>
                            <b>Message: </b>
                            {`"${message}"`}
                        </div>
                        <hr className='m-2'></hr>
                    </>
                )}
                <div className='grid grid-cols-2 gap-2 text-center auto-cols-max w-48'>
                    <div className='w-fit text-center'>
                        <h4 className='font-bold'>Original User</h4>
                        <UserIconPopup userId={userPlaced} />
                        {/* <p>{userPlaced}</p> */}
                    </div>
                    <div className='w-fit text-center'>
                        <h4 className='font-bold'>Last Moved By</h4>
                        {/* <p>{userMoved == "" ? "Nobody" : userMoved}</p> */}
                        {userMoved != '' ? (
                            <UserIconPopup userId={userMoved} />
                        ) : (
                            <p>Nobody</p>
                        )}
                    </div>
                </div>
                <hr className='m-2'></hr>
                <p>Updated on {fmtTimeplaced}</p>
                <p className='font-semibold'>
                    {minutes}m : {seconds}s ago.
                </p>
            </div>
        )
    }

    if (forcePopup) {
        return (
            <Tooltip
                key={pinId + '_tooltip_force'}
                direction='top'
                offset={[0, -40]}
                opacity={0.9}
                permanent={true}
                className={'rounded-lg border-slate-800'}
            >
                <InnerTooltip></InnerTooltip>
            </Tooltip>
        )
    } else {
        return (
            <Tooltip
                key={pinId + '_tooltip_unforced'}
                direction='top'
                offset={[0, -40]}
                opacity={0.9}
                permanent={false}
                className={'rounded-lg border-slate-800'}
            >
                <InnerTooltip></InnerTooltip>
            </Tooltip>
        )
    }
}

/**
 * Creates a popup when AI pins are placed that disappears after a few seconds.
 * Uses a Tooltip object to create the popup.
 * @param {*} props
 * @returns
 */
export function AIPopup({ timePlaced, message = '' }) {
    const [secondsSincePlaced, setSecondsSince] = useState(
        Math.floor((Date.now() - new Date(timePlaced + 'UTC')) / 1000),
    )
    const [opacity, setOpacity] = useState(0.5)
    const numSecondsToShow = 8
    const numSecondsToFade = 3

    //Update timeSincePlaced if it's been more than a second and less than numSecondsToShow seconds
    React.useEffect(() => {
        const interval = setInterval(() => {
            setSecondsSince(
                Math.floor((Date.now() - new Date(timePlaced + 'UTC')) / 1000),
            )

            //Fade out if more than numSecondsToShow-numSecondsToFade seconds have passed
            if (secondsSincePlaced > numSecondsToShow - numSecondsToFade) {
                setOpacity(
                    1.0 -
                        (secondsSincePlaced -
                            (numSecondsToShow - numSecondsToFade)) /
                            numSecondsToFade,
                )
            }
        }, 200)

        //Clear interval in numSecondsToShow seconds for performance
        setTimeout(() => {
            clearInterval(interval)
        }, (numSecondsToShow + 1) * 1000)

        return () => clearInterval(interval)
    })

    // If more than numSecondsToShow seconds have passed, fade out then don't show/render
    if (secondsSincePlaced > numSecondsToShow) {
        return <></>
    }

    return (
        <Tooltip
            direction='top'
            offset={[0, -40]}
            opacity={opacity}
            permanent={true}
            className={'rounded-lg border-slate-800 '}
        >
            <div className='p-2 w-fit'>
                {/* List Message only */}
                <div className='w-lg whitespace-normal'>
                    <b>Message: </b>
                    {`"${message}"`}
                </div>
            </div>
        </Tooltip>
    )
}

/**
 * Handles the client side logic of adding a new pin to be displayed.
 * Note that these params are passed in via a created object.
 * @note pinHandlers needs a move function that takes pinId and new lat lon, and a delete function with the same params.
 * @param pinId The ID of the new pin to be created. NOTE: Server ultimately decides Id, so get it from there preferably.
 * @param lat The latitude of the new pin to be created
 * @param lon The longitude of the new pin to be created
 * @param color The color of the new pin to be created
 * @param pinHandlers The handlers, mostly used for delete and move functionality.
 * @returns
 */
export function SharedPin({
    pinId,
    lat,
    lon,
    color,
    userMoved,
    userPlaced,
    aiPlaced,
    timePlaced,
    message = '',
    pinHandlers,
}) {
    // const [pos, setPos] = useState({lat:lat, lng:lon});

    let iconURLToUse = color == 'green' ? greenIcon : redIcon
    if (aiPlaced) {
        iconURLToUse = color == 'green' ? aiGreenIcon : aiRedIcon
    }

    let icon = new L.Icon({
        iconUrl: iconURLToUse,
        shadow: shadow,
        iconSize: aiPlaced ? [25, 61] : [25, 41],
        iconAnchor: aiPlaced ? [13, 59] : [13, 39],
        // iconAnchor: [12, 41],
        // popupAnchor: [1, -34],
        shadowSize: [41, 41],
        // className: iconUrl
        className: color + '_type',
    })

    return (
        <FeatureGroup>
            <Marker
                key={pinId + '_pin'}
                pinId={pinId}
                position={[lat, lon]}
                draggable
                icon={icon}
                eventHandlers={{
                    // move(e) {

                    //     //setPos({"lat":e.latlng.lat,"lng":e.latlng.lat});
                    // },
                    moveend(e) {
                        //Handle updated marker TODO
                        //e.target.options - get props
                        //e.target._latlng - get new latlgn
                        pinHandlers['move'](
                            pinId,
                            e.target._latlng.lat,
                            e.target._latlng.lng,
                        )
                        console.log('MOVING', e.target._latlng)
                    },
                    click(e) {
                        //Handle deleting marker TODO
                        if (!aiPlaced) {
                            pinHandlers['delete'](pinId)
                            console.log('DELETING', e)
                        }
                    },
                }}
            >
                <SharedPopup
                    pinId={pinId}
                    userMoved={userMoved}
                    userPlaced={userPlaced}
                    aiPlaced={aiPlaced}
                    timePlaced={timePlaced}
                    message={message}
                />
            </Marker>
            <Circle
                key={pinId + '_pinCircle'}
                center={[lat, lon]}
                fillOpacity={0.4}
                radius={500}
                color={color == 'green' ? '#4abd59' : '#bd4a4a'}
                fillColor={color == 'green' ? '#4abd59' : '#bd4a4a'}
            ></Circle>
        </FeatureGroup>
    )
}

export function CrimeMap(props) {
    return (
        <BaseMap
            PinGroup={<CrimeMarkerGroup pins={props.pins}></CrimeMarkerGroup>}
        ></BaseMap>
    )
}

/**
 * This is a private function used by SharedMap to handle the main
 * business logic of displaying Pins and subsequently their logic
 * @param currentColor the current color of the pin
 * @param pinHandlers a list of 3 functions that handle the possible actions (place, move, delete)
 * @param markers the pins received by the server
 * @returns A list of Pins to be displayed on the map
 */
function SharedClickCreator({ markers, currentColor, pinHandlers }) {
    useMapEvent('click', e => {
        console.log('CLICK!', e)
        pinHandlers['place'](e.latlng.lat, e.latlng.lng, currentColor)
    })

    return markers.map(marker => {
        return marker
    })
}

/**
 * This returns an instance of the shared map to be used.
 * @param currentColor the current color of the pin
 * @param pinHandlers a list of 3 functions that handle the possible actions (place, move, delete)
 * @param markers the pins received by the server
 * @returns a BaseMap isntance running the Shared logic
 */
export function SharedMap({ currentColor, pinHandlers, markers }) {
    return (
        <BaseMap
            PinGroup={
                <SharedClickCreator
                    markers={markers}
                    currentColor={currentColor}
                    pinHandlers={pinHandlers}
                ></SharedClickCreator>
            }
        ></BaseMap>
    )
}

export function ReviewMap({ pins, crimesJson }) {
    let crimePins = crimesJson.map(crime => {
        return CrimePin({
            key: crime.index,
            lat: crime.geoLat,
            lon: crime.geoLon,
            green: crime.color,
            date: crime.firstOccuranceDate,
            offense: crime.offsenseCategoryId,
            address: crime.incidentAddress,
        })
    })
    console.log('review map', pins, crimePins)

    return (
        <BaseMap
            PinGroup={
                <ReviewMarkerGroup
                    pins={pins}
                    crimePins={crimePins}
                ></ReviewMarkerGroup>
            }
        ></BaseMap>
    )
}
