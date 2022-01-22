
import React from 'react';
import ReactDOM from 'react-dom';
import { io } from "socket.io-client";

function ConfigRow(props){
    return <tr className="w-100 text-center border-gray border-b">
        <td className="py-2">{props.round_id}</td>
        <td className="py-2">{props.user_id}</td>
        <td className="py-2">{props.question}</td>
    </tr>
}

function ConfigLive(props){
    console.log(props.live_experiment)
    if(props.live_experiment == undefined){
        return <h3 className="border-b-2 py-1">
            Experiment is not live. <button>Click here to start it</button>
        </h3>
    }else{
        return <h3 className="border-b-2 py-1">
            It's live!!!
        </h3>
    }
    
}

function ConfigTable(props){
    return <div className="bg-white shadow rounded-lg p-5 my-5">
        <h2 className="font-bold text-xl border-b-2 pb-3"><small className="text-gray-500">CODE: </small>{props.code}</h2>
        <ConfigLive live_experiment={props.live_experiment}></ConfigLive>
        <h3 className="border-b-2 py-1">
            <b>Valid Users </b>
            
                {props.valid_uids.map((uid)=>{
                    return<span key={uid} className="underline mx-2">{uid}</span>
                 })}
            
        </h3>
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
}

function ConfigView(props){
    return <>
        <h1 className="font-bold text-2xl p-2 mb-5">Configs<span className="text-white bg-red-500 rounded-xl p-1 ml-2 text-xs">LIVE</span></h1>
        {props.configs.map((config)=>{
            return <ConfigTable key={config.code} live_experiment={config.live_experiment} valid_uids={config.valid_uids} code={config.code} rounds={config.rounds}></ConfigTable>
        })}
    </>
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

socket.on('echo', (args)=>{
    console.log(args);
});

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