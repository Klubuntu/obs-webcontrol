'use client';
import {useEffect, useState} from 'react';
import styles from '../../../page.module.css'
import Cookie from "js-cookie";
import OBSWebSocket from 'obs-websocket-js';
import {readConfig, saveConfig} from './utils';
import { md5 } from 'request/lib/helpers';
// import KsCryp from 'kscryp/src/KsCryp';

export default function Home() {
  let actionBtn = "";
  let actionVal = "";
  let btn_num = 0;
  const [selectedAction, setSelectedAction] = useState("");
  useEffect(() => {
    // Code to run when the page is loaded
    let cookie = Cookie.get("session")
    if(cookie){
    //   window.location.href = "/manage"
        btn_num = window.location.href.split("?btn=")[1]
        document.getElementById("btn").innerText = "Editing button: " + btn_num;
    }
    else{
    }
  }, []);
  function obsApi(action) {
    return new Promise((resolve, reject) => {
      const obs = new OBSWebSocket();
      obs.connect('ws://localhost:4455', "LZNVwGCqowRt7esU").then((info) => {
        switch (action) {
          case 'transition':
            obs.call('GetSceneTransitionList').then((data) => {
              const selectTransitions = document.createElement("select");
              selectTransitions.id = "transition";
              data.transitions.forEach(transition => {
                const option = document.createElement('option');
                option.value = transition.transitionName;
                option.text = transition.transitionName;
                selectTransitions.appendChild(option);
              });
              resolve(selectTransitions);
              obs.disconnect()
            }).catch((error) => {
              reject(error);
            });
            break;
          case 'scene':
            obs.call('GetSceneList').then((data) => {
              const selectScenes = document.createElement("select");
              selectScenes.id = "scene";
              data.scenes.forEach(scene => {
                const option = document.createElement('option');
                option.value = scene.sceneName;
                option.text = scene.sceneName;
                selectScenes.appendChild(option);
              });
              resolve(selectScenes);
              obs.disconnect()
            }).catch((error) => {
              reject(error);
            });
            break;
          default:
            reject(new Error("Invalid action"));
        }
      }).catch((error) => {
        reject(error);
      });
    });
  }

  function handleActionChange(event) {
    setSelectedAction(event.target.value);
    let val = event.target.value;
    let container = document.getElementById("set-container");
    console.log(val);
    if (val != "unset") {
      let brline = document.createElement("br");
      let save_btn = document.createElement("button");
      save_btn.textContent = "Save";
      save_btn.onclick = function () {
        if(val == "set-transition"){
          actionVal = document.getElementById("transition").value
        }
        else if(val == "set-scene"){
          actionVal = document.getElementById("scene").value
        }
        const arr = {
          [`button${btn_num}`]: {
            action: val,
            value: actionVal
          }
        };
        console.log(JSON.stringify(arr));
        saveConfig(JSON.stringify(arr))
      };
      save_btn.style.marginTop = "12px";
      save_btn.style.padding = "10px 24px";
      if (val == "set-transition") {
        container.innerHTML = "";
        let label = document.createElement("label");
        label.textContent = "Transition: ";
        label.setAttribute("for", "transition");
        label.setAttribute("className", "btnaction");
        container.appendChild(label);
        obsApi('transition')
          .then((selectTransitions) => {
            container.appendChild(selectTransitions);
            container.append(brline);
            container.appendChild(save_btn);
          })
          .catch((error) => {
            console.error(error);
          });
      } else if (val == "set-scene") {
        container.innerHTML = "";
        let label = document.createElement("label");
        label.textContent = "Scene: ";
        label.setAttribute("for", "scene");
        label.setAttribute("className", "btnaction");
        container.appendChild(label);
        obsApi('scene')
          .then((selectScenes) => {
            container.appendChild(selectScenes);
            container.append(brline);
            container.appendChild(save_btn);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } else {
      container.innerHTML = "";
    }
  }


  function saveButton(){
    console.log("Action:" + actionBtn)
  }
  function backtoHome(){
    window.location.href = "/manage"
  }
  // console.error("Invalid server");
  return (
    <main className={styles.main}>
      <h2 onClick={backtoHome}>OBS WebControl</h2>
        {/* <h4>Loading Data</h4> */}
        <h4 id="btn"></h4>
        <label htmlFor="action" className={styles.btnaction}>Action:</label>
        <select name="action" id="btn-action" className={styles.btnaction_sel} value={selectedAction} onChange={handleActionChange}>
            <option value="unset">Select</option>
            <option value="set-transition">Transition</option>
            <option value="set-scene">Change Scene</option>
        </select>
        <div id="set-container" className={styles.setcontainer}>
        </div>
    </main>
  )
}
