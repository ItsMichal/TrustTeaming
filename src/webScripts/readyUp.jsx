import * as React from "react";
import { UserPanel } from "./sharedMap";



//Just the panel that lets you ready up
//TODO: Make it so you can unready
//TODO: Make it so that Ready button disappears
//TODO: Add survey functionality between rounds
export function ReadyPanel({users, readyHook, survey, surveyHook}){
    return <>
            <h2 className="pl-5 text-xl font-bold animate-pulse">Ready Up!</h2>
            {Object.values(users).map((user) => {
                return <UserPanel key={user.userId} {...user} />
            })}
            <div className="flex flex-row gap-2">
                <div onClick={readyHook} 
                    className="flex-1 bg-blue-400 mx-5 mt-5 rounded-lg p-2 hover:bg-blue-600 active:bg-blue-800 text-white font-bold">
                    Ready!
                </div>
                {survey 
                    && 
                    <div onClick={surveyHook}>Survey</div>
                }
            </div>
        </>
}


export function DefaultPanel({message}){
    return <div className="bg-white w-fit p-5 h-fit rounded-lg m-auto">
            <h2 className="text-xl font-bold animate-pulse">{message}</h2>
        </div>
}