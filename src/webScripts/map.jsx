import React from 'react';
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
  } from 'react-leaflet'
import 'leaflet';
import greenIcon from '../assets/img/green.png';
import redIcon from '../assets/img/red.png';
import shadow from '../assets/img/shadow.png';
import allOtherCrimesIcon from "../assets/img/icons/all-other-crimes.png"
import aggravatedIcon from "../assets/img/icons/aggravated-assault.png"
import burglaryIcon from "../assets/img/icons/burglary.png";
import arsonIcon from "../assets/img/icons/arson.png"
import autoTheftIcon from "../assets/img/icons/auto-theft.png"
import drugAlcIcon from "../assets/img/icons/drug-alcohol.png"
import larcenyIcon from "../assets/img/icons/larceny.png"
import murderIcon from "../assets/img/icons/murder.png"
import otherCrimesIcon from "../assets/img/icons/other-crimes-against-persons.png"
import publicDisorderIcon from "../assets/img/icons/public-disorder.png"
import robberyIcon from "../assets/img/icons/robbery.png"
import theftIcon from "../assets/img/icons/theft-from-motor-vehicle.png"
import trafficIcon from "../assets/img/icons/traffic-accident.png"
import whiteCollarIcon from "../assets/img/icons/white-collar-crime.png"

export const offenseToIcon = {
    "all-other-crimes": allOtherCrimesIcon,
    "arson": arsonIcon,
    "auto-theft": autoTheftIcon,
    "aggravated-assault": aggravatedIcon,
    "burglary": burglaryIcon,
    "drug-alcohol": drugAlcIcon,
    "larceny": larcenyIcon,
    "murder": murderIcon,
    "other-crimes-against-persons": otherCrimesIcon,
    "public-disorder": publicDisorderIcon,
    'robbery': robberyIcon,
    'theft-from-motor-vehicle': theftIcon,
    'traffic-accident': trafficIcon,
    'white-collar-crime': whiteCollarIcon
}

export function Pin({lat, lon, green, offense, date, address}){
    
    let iconUrl;
    let iconSize;

    if(offense != undefined){
        if(offenseToIcon.hasOwnProperty(offense)){
            iconUrl = offenseToIcon[offense];
        }else{
            iconUrl = redIcon;
        }
        iconSize = [30,30];
    }else{
        if(green){
            iconUrl = greenIcon;
        }else{
            iconUrl = redIcon;
        }
        iconSize = [25,41];
    }

    return <Marker
        position={[lat, lon]}
        icon={
            new L.Icon({
                iconUrl: iconUrl,
                shadow: shadow,
                iconSize: iconSize,
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
				shadowSize: [41, 41]
            })
        }
    >
        <Popup>
            <div>
                <h1 className="font-bold text-lg">{offense}</h1>
                <h2 className="font-semibold">{address}</h2>
                {date}
            </div>
        </Popup>
    </Marker>
}

export function BaseMap({pins}){
    return <MapContainer center={[39.7392, -104.9903]} zoom={13} className={"w-full h-full"}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map(pin => {
            return pin
        })}
    </MapContainer>
}



export function CrimeMap(props){
    return <BaseMap pins={props.pins}>
    </BaseMap>
}