'use client';
import { useEffect } from 'react';
import styles from '../page.module.css'
import OBSWebSocket from 'obs-websocket-js';
import Cookie from "js-cookie";

export default function Home() {
  let obs_data = {};
  useEffect(() => {
    // Code to run when the page is loaded
    let cookie = Cookie.get("session")
    if(cookie){
      document.getElementsByTagName("form")[0].removeAttribute('hidden');
      document.getElementsByTagName("h4")[0].setAttribute("hidden", "")
      document.getElementById("container").removeAttribute("style");
      document.getElementById("info").removeAttribute("style")
      getSessionInfo();
    }
    else{
      window.location.href = "/"
    }
  }, []);
  function getSessionInfo(){
    const obs = new OBSWebSocket();
    obs.connect('ws://localhost:4455', "LZNVwGCqowRt7esU").then((info) => {
      obs.call('GetVersion').then((data) => {
        console.log('Data:', data);
        obs_data.version = data.obsVersion
        obs_data.socketversion = data.obsWebSocketVersion
        obs_data.platform = data.platformDescription
        obs_data.rpc = data.rpcVersion
        document.getElementById("over").innerText = obs_data.version
        document.getElementById("osockver").innerText = obs_data.socketversion
        document.getElementById("oplat").innerText = obs_data.platform
        document.getElementById("orpcver").innerText = obs_data.rpc
      });
    }, () => {
        console.error('Error Connecting')
    });
  }
  function openDesk(){
    window.location.href = "/manage/desk"
  }
  function closeSession(){
    Cookie.remove("session")
    window.location.href = "/"
  }
  // console.error("Invalid server");
  return (
    <main className={styles.main}>
      <h2 className={styles.h2app}>OBS WebControl</h2>
          <h4>Loading Data</h4>
          <form method="#" hidden>
            <button onClick={closeSession}>Log out</button>
          </form>
          <button onClick={getSessionInfo}>Refresh</button>
          <div id="info" className={styles.info} style={{display: 'none'}}>
            <b>Welcome</b>
            <p>OBS Version: <span id="over">{obs_data.version}</span></p>
            <p>OBS Socket Version: <span id="osockver">{obs_data.socketversion}</span></p>
            <p>Platform: <span id="oplat">{obs_data.platform}</span></p>
            <p>RPC Socket Version: <span id="orpcver">{obs_data.rpc}</span></p>
          </div>
          <div id="container" className={styles.containerapp} style={{display: 'none'}}>
            <div onClick={openDesk} className={styles.buttonapp}>OBS Desk</div>
            <div className={styles.buttonapp}>Virtual Desk</div>
          </div>
    </main>
  )
}
