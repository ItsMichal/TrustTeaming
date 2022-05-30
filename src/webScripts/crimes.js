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

export const offenses = [
    'all-other-crimes',
    'arson',
    'auto-theft',
    'aggravated-assault',
    'burglary',
    'drug-alcohol',
    'larceny',
    'murder',
    'other-crimes-against-persons',
    'public-disorder',
    'robbery',
    'theft-from-motor-vehicle',
    'traffic-accident',
    'white-collar-crime'
]

export const offensesToReadable = {
    'all-other-crimes': "All Other Crimes",
    'arson': "Arson",
    'auto-theft': "Car Theft",
    'aggravated-assault': "Aggravated Assault",
    'burglary': "Burglary",
    'drug-alcohol': "Drug/Alcohol",
    'larceny': "Larceny",
    'murder': "Murder",
    'other-crimes-against-persons': "Other Crimes Against Persons",
    'public-disorder': "Public Disorder",
    'robbery': "Robbery",
    'theft-from-motor-vehicle':"Theft from (inside) Vehicle",
    'traffic-accident': "Traffic Accident",
    'white-collar-crime': "White-Collar Crime"
}