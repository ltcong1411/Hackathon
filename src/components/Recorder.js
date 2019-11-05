import ReactAudioPlayer from './Audio';
import PropTypes from 'prop-types';
import './css/adinsex.css';

const React = require('react');
const RecordRTC = require('recordrtc');
const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;

var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);
var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
var recorder;

async function checkMicrophone(cb) {
  let canRecord = true;
  if (typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
    canRecord = false;
    // alert('This browser does not supports WebRTC getUserMedia API.');
    if (!!navigator.getUserMedia) {
      // alert('This browser seems supporting deprecated getUserMedia API.');
      canRecord = false;
    }
  }
  if (!canRecord) {
    throw new Error('The browser does not support recording audio');
  }
  const mic = await navigator.mediaDevices.getUserMedia({
    audio: isEdge ? true : {
      echoCancellation: false
    }
  });
  return cb(mic);
}

function record(microphone) {
  var options = {
    type: 'audio',
    numberOfAudioChannels: isEdge ? 1 : 2,
    checkForInactiveTracks: true,
    bufferSize: 16384
  };
  if (isSafari || isEdge) {
    options.recorderType = StereoAudioRecorder;
  }
  if (navigator.platform && navigator.platform.toString().toLowerCase().indexOf('win') === -1) {
    options.sampleRate = 48000; // or 44100 or remove this line for default
  }
  if (isSafari) {
    options.sampleRate = 44100;
    options.bufferSize = 4096;
    options.numberOfAudioChannels = 2;
  }

  if (recorder) {
    recorder.destroy();
    recorder = null;
  }
  recorder = RecordRTC(microphone, options);
  recorder.startRecording();
}

class Recorder extends React.Component {
  constructor(props) {
    super(props)


    this.player = React.createRef();
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);
    this.record = this.record.bind(this);
    this.songEnded = this.songEnded.bind(this);

    this.state = ({
      started: false,
      audioMuted: true,
      recording: false,
      playing: false,
      errorMessage: '',
    });
  }

  async record(e) {
    e.preventDefault();
    this.setState({ started: true });


    try {
      await checkMicrophone((microphone) => {
        this.setState({
          recording: true,
          playing: false,
        })
        record(microphone);
      })
    }
    catch (e) {
      this.setState({
        errorMessage: e,
      })
    }
  }

  async stop(e) {
    e.preventDefault();
    const self = this;

    recorder.stopRecording(() => {
      self.props.onRecorded(recorder);
      self.setState({
        recording: false,
        playing: false,
      });
    });
  }

  async play(e) {
    e.preventDefault();
    // console.log('play ne', this.props.audioSrc);
    this.setState({
      playing: true,
    });
    this.player.audioEl.play();
  }

  async songEnded(e) {
    // console.log('stop ne');
    this.setState({
      playing: false,
    });
  }

  disabled(condition) {
    return condition ? 'disabled' : '';
  }

  render() {
    return (
      <div id="recorder" className="form-group row" >
        <label className="control-label col-sm-3 col-form-label">Description</label>

        <div className="col-sm-9">
          <button id="recorder-btn-record" title="Record" className={`recorder-btn ${this.disabled(this.state.recording)}`} disabled={this.disabled(this.state.recording)} onClick={this.record}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 152c-57.2 0-104 46.8-104 104s46.8 104 104 104 104-46.8 104-104-46.8-104-104-104zm0-104C141.601 48 48 141.601 48 256s93.601 208 208 208 208-93.601 208-208S370.399 48 256 48zm0 374.4c-91.518 0-166.4-74.883-166.4-166.4S164.482 89.6 256 89.6 422.4 164.482 422.4 256 347.518 422.4 256 422.4z" /></svg>
          </button>
          <button id="recorder-btn-end" title="Pause" className={`recorder-btn ${this.disabled(!this.state.recording)}`} disabled={this.disabled(!this.state.recording)} onClick={this.stop}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M405.333 64H106.667C83.198 64 64 83.198 64 106.667v298.666C64 428.802 83.198 448 106.667 448h298.666C428.802 448 448 428.802 448 405.333V106.667C448 83.198 428.802 64 405.333 64z" /></svg>
          </button>
          <button id="recorder-btn-play" title="Play" className={`recorder-btn ${this.disabled(this.state.recording)}`} disabled={this.disabled(this.state.recording)} onClick={this.play}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M128 104.3v303.4c0 6.4 6.5 10.4 11.7 7.2l240.5-151.7c5.1-3.2 5.1-11.1 0-14.3L139.7 97.2c-5.2-3.3-11.7.7-11.7 7.1z" /></svg>
          </button>
          {/* <button id="recorder-btn-play" title="Continue record" className={`recorder-btn`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M199.9 416h-63.8c-4.5 0-8.1-3.6-8.1-8V104c0-4.4 3.6-8 8.1-8h63.8c4.5 0 8.1 3.6 8.1 8v304c0 4.4-3.6 8-8.1 8zM375.9 416h-63.8c-4.5 0-8.1-3.6-8.1-8V104c0-4.4 3.6-8 8.1-8h63.8c4.5 0 8.1 3.6 8.1 8v304c0 4.4-3.6 8-8.1 8z" /></svg>
          </button> */}
          <ReactAudioPlayer src={this.props.data} ref={c => (this.player = c)}
            onEnded={this.songEnded}
            muted={this.state.recording}
          />
        </div>
      </div >
    );
  }
}

Recorder.propTypes = {
  onRecorded: PropTypes.func,
}

export default Recorder