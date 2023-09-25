'use client';
import { useEffect } from 'react';
import styles from '../../page.module.css'
import OBSWebSocket from 'obs-websocket-js';
import Cookie from "js-cookie";
import BoxGenerator from './utils';

export default function Home() {
  let connected=false
  let obsapi = {}
  const obs = new OBSWebSocket();
  obsapi.recStart = false;
  useEffect(() => {
    // Code to run when the page is loaded
    let cookie = Cookie.get("session")
    if(cookie){
        console.log(connected)
        // if(!connected){
        //     obs.connect('ws://localhost:4455', "LZNVwGCqowRt7esU").then((info) => {
        //         // eslint-disable-next-line react-hooks/exhaustive-deps
        //         connected=true
        //     }, () => {
        //         console.error('Error Connecting')
        //     });
        // }
      document.getElementsByTagName("form")[0].removeAttribute('hidden');
      document.getElementsByTagName("h4")[0].setAttribute("hidden", "");
      obsApi('autorun');
    }
    else{
      window.location.href = "/"
    }
  }, []);
  function formatMil(milliseconds) {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  
    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    return formattedTime;
  }
  
  function padZero(number) {
    return number.toString().padStart(2, '0');
  }
  
  function obsApi(action){
    const obs = new OBSWebSocket();
    obs.connect('ws://localhost:4455', "LZNVwGCqowRt7esU").then((info) => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        let rec_btn = document.getElementById("rec")
        let stream_btn = document.getElementById("stream")
        let recTime = document.getElementById("rec-time")
        if(action == 'record'){
            obs.call('GetRecordStatus').then((status) =>{
                console.log(status.outputActive)
                if(status.outputActive){
                    rec_btn.innerText = "Record"
                    recTime.innerHTML = "00:00:00"
                    clearInterval(obsapi.recInterval)
                    obsapi.recInterval = "";
                    obsapi.recStart = false;
                    obs.call('StopRecord')
                }
                else{
                    rec_btn.innerText = "Stop Record"
                    let rectime = status.outputDuration
                    obsapi.recInterval = setInterval(function(){
                        if(obsapi.recStart){
                            recTime.innerHTML = formatMil(Number(rectime + 2500))
                            rectime += 1000;
                        }
                    },1000)
                    obs.call('StartRecord')
                }
            })
        }
        else if(action == 'stream'){
            obs.call('GetStreamStatus').then((status) =>{
                console.log(status.outputActive)
                if(status.outputActive){
                    stream_btn.innerText = "Stream"
                    obs.call('StopStream')
                }
                else{
                    stream_btn.innerText = "Stop Stream"
                    obs.call('StartStream')
                }
            })
        }
        else if(action == 'switch'){
            const switchScene = document.getElementById("scene").value
            const switchTransition = document.getElementById("transition").value
            obs.call('SetCurrentSceneTransition', {transitionName: switchTransition})
            obs.call('SetCurrentProgramScene', {sceneName: switchScene})
        }
        else if(action == 'autorun'){
            obs.call('GetSceneList').then((data) => {
                console.log(data)
                obsapi.currentscene = data.currentProgramSceneName;
                const selectScenes = document.getElementById("scene")
                data.scenes.forEach(scene => {
                    const option = document.createElement('option');
                    option.value = scene.sceneName;
                    option.text = scene.sceneName;
                    selectScenes.appendChild(option);
                });
            });
            obs.call('GetSceneTransitionList').then((data) => {
                console.log(data)
                const selectTransitions = document.getElementById("transition")
                data.transitions.forEach(transition => {
                    const option = document.createElement('option');
                    option.value = transition.transitionName;
                    option.text = transition.transitionName;
                    selectTransitions.appendChild(option);
                });
            });
            obs.call('GetRecordStatus').then((status) => {
                if(status.outputDuration > 0){
                    let rectime = status.outputDuration
                    rec_btn.innerText = "Stop Record"
                    obsapi.recStart = true
                    obsapi.recInterval = setInterval(function(){
                        if(obsapi.recStart){
                            recTime.innerHTML = formatMil(Number(rectime + 2500))
                            rectime += 1000;
                        }
                    },1000)
                }
            });
        }

    }, () => {
        console.error('Error Connecting')
    });

  }
  function backtoHome(){
    window.location.href = "/manage"
  }
  function closeSession(){
    Cookie.remove("session")
    window.location.href = "/"
  }
  // console.error("Invalid server");
  return (
    <main className={styles.main}>
      <header className={styles.topdesk}>
        <h3 onClick={backtoHome}>OBS WebControl</h3>
        <button id="rec" onClick={() => obsApi('record')}>Record</button>
        <button id="stream" onClick={() => obsApi('stream')}>Stream</button>
        <select name="scene" id="scene">
            <option value="placeholder" default disabled>Scene</option>
        </select>
        <select name="transition" id="transition">
            <option value="placeholder" default disabled>Transition</option>
        </select>
        <button onClick={() => obsApi('switch')}>Switch Scene</button>
        <span>REC: <span id="rec-time">00:00:00</span></span>
        <span>LIVE: <span id="live-time">00:00:00</span></span>
        <form method="#" className={styles.topdeskexit}>
            <button onClick={closeSession}>Log out</button>
        </form>
      </header>
          <h4>Loading Data</h4>
          <BoxGenerator col={7} row={4} color="red" />
    </main>
  )
}
