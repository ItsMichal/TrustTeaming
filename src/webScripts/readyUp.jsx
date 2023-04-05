import * as React from "react";
import { UserPanel } from "./sharedMap";



//Just the panel that lets you ready up
//TODO: Make it so you can unready
//TODO: Make it so that Ready button disappears
//TODO: Add survey functionality between rounds
export function ReadyPanel({users, readyHook, survey, surveyHook}){
    //If survey is length 0, then set to false
    if(!survey || survey.length == 0){
        survey = false;
    }

    const [surveyClicked, setSurveyClicked] = React.useState(false);

    function onSurveyClick(){
        if(surveyHook){
            surveyHook();
        }

        setSurveyClicked(true);
    }

    return <>
            <h2 className="pl-5 text-xl font-bold animate-pulse">Ready Up!</h2>
            {Object.values(users).map((user) => {
                return <UserPanel key={user.userId} {...user} />
            })}
            <div className="flex flex-row gap-2">
                {(!survey || surveyClicked) && 
                    <div onClick={readyHook} 
                        className="flex-1 bg-blue-400 mx-5 mt-5 rounded-lg p-2 hover:bg-blue-600 active:bg-blue-800 text-white font-bold">
                        Ready!
                    </div>
                }
                {survey && !surveyClicked 
                    && 
                    <a 
                        href={survey}
                        target="_blank"
                        rel = "noreferrer"
                        className="flex-1 bg-purple-600 mx-5 mt-5 rounded-lg p-2 hover:bg-purple-700 active:bg-purple-900 text-white font-bold"
                        onClick={onSurveyClick}>
                            Take Survey
                    </a>
                }
            </div>
        </>
}


export function DefaultPanel({message}){
    return <div className="bg-white w-fit p-5 h-fit rounded-lg m-auto">
            <h2 className="text-xl font-bold animate-pulse">{message}</h2>
        </div>
}