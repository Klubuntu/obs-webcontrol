'use client';
import { useEffect } from 'react';
import styles from './page.module.css'
import OBSWebSocket from 'obs-websocket-js';
import Cookie from "js-cookie";
import { md5 } from 'request/lib/helpers';
// import KsCryp from 'kscryp/src/KsCryp';

export default function Home() {
  useEffect(() => {
    // Code to run when the page is loaded
    let cookie = Cookie.get("session")
    if(cookie){
      window.location.href = "/manage"
    }
    else{
      document.getElementsByTagName("form")[0].removeAttribute('hidden');
      document.getElementsByTagName("h4")[0].innerText = "Type OBS WebSocket Data"
      document.getElementById("address").value = "ws://192.168.0.200:4455"
      document.getElementById("pass").value = "LZNVwGCqowRt7esU"
    }
  }, []);
  function validateForm(e){
    e.preventDefault();
    let address = document.getElementById("address").value
    let pass = document.getElementById("pass").value
    let label = document.getElementById("label")
    // console.log(address, pass)
    const obs = new OBSWebSocket();
    obs.connect(address, pass)
    .then((result) => {
      label.style.display = "none";
      console.log("OBS: Connected")
      const sessionData = pass + "_enc_" + address;
      const encodedSession = md5(sessionData) + "=="
      Cookie.set('session', encodedSession)
      window.location.href = "/manage"
    }).catch((err)  => {
      label.style.display = "block";
      let copyerr = err
      if(err.toString().includes("SyntaxError: Failed to construct 'WebSocket'")){
        label.innerHTML = "Error: Invalid OBS URL"
      }
      else if(err == "Error: Your payload's data is missing an `authentication` string, however authentication is required."){
        label.innerHTML = "Error: Empty Password"
      }
      else if(err = "Error."){
        label.innerHTML = "Error: OBS don't run"
      }
      else{
        label.innerHTML = copyerr.toString().replace(".","")
      }
    })
  }
  console.error("Invalid server");
  return (
    <main className={styles.main}>
      <h2>OBS WebControl</h2>
        <h4>Loading Data</h4>
        <form action="#" hidden>
          <input type="text" id="address" placeholder="ws://localhost:4455"  className={styles.input} required></input><br></br>
          <input type="password" id="pass" placeholder="Password" className={styles.input} required></input><br></br>
          <p id="label" className={styles.label} hidden>Label</p>
          <input type="submit" value="Login" className={styles.input +" "+ styles.button} onClick={validateForm}></input>
        </form>
    </main>
  )
}
