const { desktopCapturer} = require("electron");
const {Menu,dialog}=require('@electron/remote');
const { writeFile } = require("fs");
//getting the buttons
const videoElement=document.querySelector('video');
const startBtn=document.getElementById('startBtn');
const stopBtn=document.getElementById('stopBtn');
const videoSelectBtn=document.getElementById('videoSelectBtn');

videoSelectBtn.onclick=getVideoSources;



//get all the available video sources
async function getVideoSources(){

    const availableSources=await desktopCapturer.getSources({
        types:['window','screen']
    })
    const videoOptionsMenu=Menu.buildFromTemplate(
        availableSources.map(source=>{
                return{
                    label:source.name,
                    click:()=>selectSource(source)
                }
        })
    );

videoOptionsMenu.popup();
}
let mediaRecorder;
const recordedChunks=[];

async function selectSource(source){
    videoSelectBtn.innerText=`Selected: ${source.name}`;
    const constraints={
        audio:false,
        video:{
            mandatory:{
                chromeMediaSource:'desktop',
                chromeMediaSourceId:source.id
            }
        }
    };

    const stream=await navigator.mediaDevices.getUserMedia(constraints);

    videoElement.srcObject=stream;
    videoElement.play();
    // Create the Media Recorder
  const options = { mimeType: 'video/webm; codecs=vp8' };
  mediaRecorder = new MediaRecorder(stream, options);

  // Register Event Handlers
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;

  // Updates the UI
}

// Captures all recorded chunks
function handleDataAvailable(e) {
  console.log('video data available');
  recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp8'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save video',
    defaultPath: `vid-${Date.now()}.webm`
  });

  if (filePath) {
    writeFile(filePath, buffer, () => console.log('video saved successfully!'));
  }

}

startBtn.onclick = e => {
  mediaRecorder.start();
  startBtn.classList.add('is-danger');
  startBtn.innerText = 'Recording';
};



stopBtn.onclick = e => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};