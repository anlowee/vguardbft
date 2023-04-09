import {useEffect, useRef, useState} from "react";

export function useCrossTabState(stateKey,defaultValue){
  const [state,setState] = useState(defaultValue)
  const isNewSession = useRef(true)
  useEffect(()=>{
    if(isNewSession.current){
      const currentState = localStorage.getItem(stateKey)
      if(currentState){
        setState(JSON.parse(currentState))
      }else{
        setState(defaultValue)
      }
      isNewSession.current=false
      return
    }
    try{
      localStorage.setItem(stateKey,JSON.stringify(state))
    }catch(error){}
  },[state,stateKey,defaultValue])
  useEffect(()=>{
    const onReceiveMessage = (e) => {
      const {key,newValue} = e
      if(key===stateKey){
        setState(JSON.parse(newValue))
      }
    }
    window.addEventListener('storage',onReceiveMessage)
    return () => window.removeEventListener('storage',onReceiveMessage)
  },[stateKey,setState])
  return [state,setState]
}