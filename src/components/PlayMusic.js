import React, { Component } from 'react';
import { Button } from "reactstrap";

class PlayMusic extends Component {
  state = {
    play: false
  }
  audio = new Audio(this.props.url)

  togglePlay = () => {
    this.setState({ play: !this.state.play }, () => {
      this.state.play ? this.audio.play() : this.audio.pause();
    });
  }

  render() {
    return (
      <div className={`PlayMusic ` + this.props.styles}>
        <Button color="primary" className="round" onClick={this.togglePlay}>{this.state.play ? 'Pause' : 'Play'}</Button>{' '}
      </div>
    )
  }
}

export default PlayMusic;