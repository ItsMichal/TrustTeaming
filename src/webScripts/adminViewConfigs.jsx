
import React from 'react';
import ReactDOM from 'react-dom';

function ConfigRow(props){
    console.log(props)
    return <tr>
        <td>{props.round_id}</td>
        <td>{props.user_id}</td>
        <td>{props.question}</td>
    </tr>
}

function ConfigTable(props){
    console.log(props)
    return <div class="bg-white shadow rounded-lg p-5">
        <h2 class="font-bold text-xl border-b-2"><small class="text-gray-500">CODE: </small>{props.code}</h2>
        <h3>{props.valid_uids.map((uid)=>{
            uid
        })}</h3>
        <table class="table p-4">
            <thead>
                <tr>
                    <th class="border-b-2 p-4 dark:border-dark-5 whitespace-nowrap font-normal text-gray-900">Round #</th>
                    <th class="border-b-2 p-4 dark:border-dark-5 whitespace-nowrap font-normal text-gray-900">User #</th>
                    <th class="border-b-2 p-4 dark:border-dark-5 whitespace-nowrap font-normal text-gray-900">Question</th>
                </tr>
            </thead>
            <tbody>
                {props.rounds.map((round) => {
                    return <ConfigRow key={props.code + "_"+round.ound_id+"_"+round.user_id}  round_id={round.round_id} user_id={round.user_id} question={round.question}></ConfigRow>
                })}
            </tbody>
        </table>
    </div>
}

function ConfigView(props){
    console.log(props.configs)
    return <>
        <h1 class="font-bold text-2xl p-2 mb-5">Configs<span class="text-white bg-red-500 rounded-xl p-1 ml-2 text-xs">LIVE</span></h1>
        {props.configs.map((config)=>{
            return <ConfigTable key={config.code} valid_uids={config.valid_uids} code={config.code} rounds={config.rounds}></ConfigTable>
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