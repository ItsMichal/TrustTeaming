
import React from 'react';
import ReactDOM from 'react-dom';
import { io } from "socket.io-client";
import { DateTime, Duration } from "luxon";
import { motion } from "framer-motion"
import { ConfigAccordion } from './accordion';

function ConfigRow(props){
    return <tr className="w-100 text-center border-gray border-b">
        <td className="py-2">{props.round_id}</td>
        <td className="py-2">{props.user_id}</td>
        <td className="py-2">{props.question}</td>
    </tr>
}

function stopExperiment(code){
    socket.emit("stopExperiment", {"code": code});
    document.getElementById("statusHead_"+code).innerHTML = "Stopping..."
}

function ConfigLive(props){
    console.log(props.live_experiment)
    if(props.live_experiment == undefined){
        return <h3 id={"notLive_"+props.code} className="border-b-2 py-1">
            Experiment is not live. <button onClick={()=>startExperiment(props.code)} className="bg-blue-500 p-2 text-white border border-b-4 border-blue-600 shadow-md hover:border-blue-800 active:mt-0.5 active:border-b-2 hover:bg-blue-600 hover:shadow-sm active:bg-blue-600 active:text-blue-100  active:shadow-inner rounded-xl">Start</button>
        </h3>
    }else{
        return <div className="border-b-2 py-1">
            <table className="table p-4 w-full">
                <thead>
                    <tr>
                        <th colSpan="2" id={"statusHead_"+props.code} className="border-b-2 font-bold p-4 dark:border-dark-5 whitespace-nowrap text-xl text-gray-900">
                            <span className="animate-pulse text-white bg-red-500 rounded-xl p-1 ml-2 text-xs">LIVE</span> 
                            Status 
                            <button onClick={()=>stopExperiment(props.code)} className="bg-red-500 text-sm ml-2 p-2 text-white border border-b-4 border-red-600 shadow-md hover:border-red-800 active:mt-0.5 active:border-b-2 hover:bg-red-600 hover:shadow-sm active:bg-red-600 active:text-red-100  active:shadow-inner rounded-xl">
                                Stop! (Destroys Data)
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    
                    <tr className="w-100 text-center border-gray border-b">
                        <td className="py-2 font-bold">Time Since Start</td>
                        <td className="py-2">Started {DateTime.fromISO(props.live_experiment.time_started).toRelative()}</td>
                    </tr>
                    <tr className="w-100 text-center border-gray border-b">
                        <td className="py-2 font-bold">State</td>
                        <td className="py-2">{props.live_experiment.state}</td>
                    </tr>
                    <tr className="w-100 text-center border-gray border-b">
                        <td className="py-2 font-bold">Round</td>
                        <td className="py-2">{props.live_experiment.curRoundNum}</td>
                    </tr>
                    <tr className="w-100 text-center border-gray border-b">
                        <td className="py-2 font-bold">Time elapsed in round</td>
                        <td className="py-2">{props.live_experiment.timeInRound}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    }
    
}

function startExperiment(code){
    socket.emit("sendStart", {"code":code});    
    document.getElementById("notLive_"+code).innerHTML = "Loading..."
}

function ConfigTable(props){
    console.log(props);
    return <div className="bg-white shadow rounded-lg p-5 my-5">
        <h2 className="font-bold text-xl border-b-2 pb-3"><small className="text-gray-500">CODE: </small>{props.code}</h2>
        <ConfigLive live_experiment={props.live_experiment} code={props.code}></ConfigLive>
        <div className="bg-gray-100 shadow rounded-lg p-5 my-5">
            <ConfigAccordion topElement={<h3 className="border-b-2 py-1 text-center text-xl font-bold">
                Configuration
            </h3>} innerElement={
            <div>
                <div className="border-b-2 py-1">
                    <b>Valid Users </b>
                    
                        {props.valid_uids.map((uid)=>{
                            return<span key={uid} className="underline mx-2">{uid}</span>
                        })}
                    
                </div>
                <table className="table p-4 w-full">
                    <thead>
                        <tr>
                            <th className="border-b-2 p-4 dark:border-dark-5 whitespace-nowrap font-normal text-gray-900">Round #</th>
                            <th className="border-b-2 p-4 dark:border-dark-5 whitespace-nowrap font-normal text-gray-900">User #</th>
                            <th className="border-b-2 p-4 dark:border-dark-5 whitespace-nowrap font-normal text-gray-900">Question</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.rounds.map((round) => {
                            return <ConfigRow key={props.code + "_"+round.round_id+"_"+round.user_id}  round_id={round.round_id} user_id={round.user_id} question={round.question}></ConfigRow>
                        })}
                    </tbody>
                </table>
            </div>
            }></ConfigAccordion>
        </div>
    </div>
}


class ConfigView extends React.Component {
    constructor(props){
        super(props);
        this.state = {"live_experiment":{}}
        props.configs.forEach(element => {
            this.state.live_experiment[element.code] = "Loading...";
        });
        socket.on("liveexp", this.updateState);
        socket.emit("sendLive");
    }
    updateState = (live_experiments)=>{
        console.log("UPDATING");
        this.setState({
            "live_experiment": live_experiments.live_experiments
        })
    }
    tick() {
        socket.emit("sendLive");
    }
    componentDidMount(){
        this.timerID = setInterval(
            () => this.tick(),
            5000
        );
    }
    componentWillUnmount(){
        clearInterval(this.timerID);
    }
    render = () => {
        return <>
                <h1 className="font-bold text-2xl p-2 mb-5">Configs</h1>
                {this.props != undefined && 
                    this.props.configs.map((config)=>{
                        console.log(this.state)
                        return <ConfigTable key={config.code} live_experiment={this.state.live_experiment[config.code]} valid_uids={config.valid_uids} code={config.code} rounds={config.rounds}></ConfigTable>
                    })
                }
            </>;
    }
}

//https://stackoverflow.com/questions/39019094/reactjs-get-json-object-data-from-an-url
function getConfigs() {
    return fetch('/admin/getConfig')
        .then((response) => response.json())
        .then((responseJson) => {
            
            return responseJson;
        })
        .catch((error) => {
            console.error(error);
        });
 }

const socket = io('/admin');

socket.on('connect', ()=>{
    console.log("Connected to " + socket.nsp);
});

function renderConfigView(){
    getConfigs().then((configs) =>{
        ReactDOM.render(
            <ConfigView configs={configs.configs}></ConfigView>,
            document.getElementById("configView")
        )
    })
}
renderConfigView()

//  ReactDOM.render()