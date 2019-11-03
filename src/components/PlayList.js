import React, { Component } from 'react';
import { Button } from "reactstrap";

class PlayList extends Component {
  constructor() {
    super()
    this.state = {
      currentAudioFile: 0,
    }
    this.audiofiles = [
      {
        label: 'Heater-1',
        url: 'https://storage.googleapis.com/sugar-maroon/records/402c8360-fc90-11e9-a051-2ff539329425'
      },
      {
        label: 'Heater-2',
        url: 'http://streaming.tdiradio.com:8000/house.mp3'
      }
    ]
  }

  render() {
    return (
      <div>
        <audio id="Player" controls>
          <source src={this.audiofiles[this.state.currentAudioFile].url} type="audio/mp3"></source>
        </audio>
      </div>
    )
  }
}

export default PlayList;