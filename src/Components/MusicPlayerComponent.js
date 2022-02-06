import React from 'react';
class MusicPlayerComponent extends React.Component {
    constructor(props) {
        super(props);
        this.weiter = this.weiter.bind(this);
        this.gestures = this.gestures.bind(this);
        this.state = {
            token: props.token,
            player: '',
            currentPalmPosition: -1,
            timeVisible: -1,
            gestureDone: false,
            track : {
                name: "Willkommen zu MusiG",
                album: {
                    images: [
                        { url: "" }
                    ]
                },
                artists: [
                    { name: "" }
                ]
            }

        }
 
    }



    componentDidMount() {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'MusiG',
                getOAuthToken: cb => { cb(this.state.token); },
                volume: 0.5
            });

            this.state.player = player;

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.connect();

            console.log('Player: ', player)


            

            player.addListener('player_state_changed', ( state => {
                
                if (!state) {
                    return;
                }
                this.setState({track: state.track_window.current_track})
                
                console.log('Track !!!' + this.state.track.name)
                this.isPaused = state.paused;
                this.isActive = false;
                
            }));

        };

        /** Gestures */
       let controller =  window.Leap.loop({ enableGestures: true }, ()=>{
        let frame2 = controller.frame(15);
        if (frame2.valid && frame2.gestures.length > 0) {
            this.leapGestures(frame2)
        } else {
            this.ourGestures(frame2)
        }
       });
    }

    gestures(frame) {
        if (frame.valid && frame.gestures.length > 0 && frame.hands.length > 0) {
            this.leapGestures(frame);
            return;
        } else {
            this.ourGestures(frame)
        }

    }

    leapGestures(frame) {
        frame.gestures.forEach((gesture) => {
            switch (gesture.type) {
                case "circle":
                    //this.lauter();
                    //.jump()
                    console.log("Circle Gesture");

                    break;
                case "swipe":
                    //Classify swipe as either horizontal or vertical
                    var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
                    //Classify as right-left or up-down
                    if (isHorizontal && frame.hands[0] !== undefined && (frame.hands[0].direction[1] <= 0.7)) {
                        if (gesture.direction[0] > 0) {
                            this.weiter();
                            return;
                        } else {
                            this.zurueck();
                            return;
                        }
                    }
                    console.log("Swipe Gesture");
                    break;
                default:
                    break;
            }
        });
    }


    ourGestures(frame) {
        if (frame.hands.length > 0 && !this.state.gestureDone) {
            frame.hands.forEach((hand) => {
                if (hand.direction[1] >= 0.8) {
                    this.gestureStop(hand);
                } else if (hand.palmPosition[1] >= this.state.currentPalmPosition) {
                    console.log(this.state.currentPalmPosition)
                    this.gestureVolup(hand);
                } else if (hand.palmPosition[1] <= this.state.currentPalmPosition) {
                    this.gestureVoldown(hand);
                    console.log(this.state.currentPalmPosition)
                }
            })
        } else if (frame.hands.length === 0 && this.state.gestureDone) {
            this.state.gestureDone = false;
        }
    }

    skipSeconds(){

    }

    gestureVolup(hand) {
        this.lauter();
        console.log("LAUTER!");
        this.setState({
            currentPalmPosition: hand.palmPosition[1]
        });
    }

    gestureVoldown(hand) {
        this.leiser();
        console.log("LEISER!");
        this.setState({
            currentPalmPosition: hand.palmPosition[1]
        });
    }
    gestureStop(hand) {
        console.log("HALT STOP");
        this.state.timeVisible = hand.timeVisible;
        this.state.gestureDone = true;
        setTimeout(() => {
            console.log("2sec")
            if (hand.direction[1] >= 0.8) {
                this.stop();
                setTimeout(() => {
                    this.state.gestureDone = false;
                }, 2000);
            }
        }, 1);
    }
    leiser() {
        console.log("leiser");
        let volume_percentage;
        this.state.player.getVolume().then(volume => {
            //volume_percentage = volume * 100;
            //console.log(`The volume of the player is ${volume_percentage}%`);
            if ((volume - 0.01) > 0) {
                this.state.player.setVolume(volume - 0.01).then(() => {
                    console.log('Volume' + volume);
                });
            }
        });

    }

    lauter() {
        console.log("lauter");
        this.state.player.getVolume().then(volume => {
            //volume_percentage = volume * 100;
            //console.log(`The volume of the player is ${volume_percentage}%`);
            if ((volume + 0.01) < 1) {
                this.state.player.setVolume(volume + 0.01).then(() => {
                    console.log('Volume' + volume);
                });
            }
        });
    }

    stop() {
        this.state.player.togglePlay().then(() => {
            console.log("ich mache was (Start/Stop)")
        });
    }

    weiter() {
        this.state.player.nextTrack().then(() => {
            console.log('Skipped to next track!');
        });
    }

    zurueck() {
        this.state.player.previousTrack().then(() => {
            console.log('Skipped to next track!');
        });
    }

  /*   jump(){

        this.state.player.addListener('player_state_changed',({
            position,  
        }) => {
            if(position){
            this.state.player.seek(position + 15000);
            console.log("jumpo")
            }
            
        });
        //console.log(this.state.player)
        //this.state.player.seek()
    } */


    render() {
        console.log('In render MusikPlayer ' + this.state.track.name)
        const track = this.state.track.name;
        return (
            <div className="container">
                <div className="main-wrapper">
            
                <img src={this.state.track.album.images[0].url} 
                     className="now-playing__cover" alt="" />

                <div className="now-playing__side">
                    <div className="now-playing__name">{
                                  this.state.track.name
                                  }</div>

                    <div className="now-playing__artist">{
                                  this.state.track.artists[0].name
                                  }</div>
                </div>
                    {/* <button onClick={() => this.leiser()}>Leiser</button>
                    <button onClick={() => this.lauter()}>Lauter</button>
                    <button onClick={() => this.weiter()}>Weiter</button>
                    <button onClick={() => this.zurueck()}>Zurück</button> */}
                </div>
            </div>
        );
    }
}
export default MusicPlayerComponent;