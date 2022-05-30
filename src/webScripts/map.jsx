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
import {offenseToIcon} from './crimes';

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