import React from 'react';
/**
 * Component to recognize gestures and control Spotify functions
 */
class MusicPlayerComponent extends React.Component {
    constructor(props) {
        super(props);
        this.next = this.next.bind(this);
        this.gestures = this.gestures.bind(this);
        this.state = {
            // Token from SpotifyAuthorizationComponent
            token: props.token,
            player: '',
            currentPalmPosition: -1,
            timeVisible: -1,
            gestureDone: false,
            // Default track to show for the start-View
            track: {
                name: "Willkommen zu MusiG",
                album: {
                    images: [
                        { url: "" }
                    ]
                },
                artists: [
                    { name: "Verbinden Sie sich mit Spotify!" }
                ]
            },
            trackPosition: -1

        }

    }


    componentDidMount() {
        // Append Spotify-API Script to App-Body
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);
        // Checks if there is an active Player
        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'MusiG',
                getOAuthToken: cb => { cb(this.state.token); },
                volume: 0.5
            });

            this.state.player = player;

            // Connect to new Spotify-API instance
            player.connect();

            // if state of current player has changed global vars are beeing updated
            player.addListener('player_state_changed', (state => {
                if (!state) {
                    return;
                }
                this.setState({ track: state.track_window.current_track })
                this.setState({ position: state.position })
                this.isPaused = state.paused;
                this.isActive = false;

            }));

        };

        // Leapjs checks if a valid frame and leapjs- gesture has been recognized
        // true => Leapjs gestures are beeing checked
        // false => self implemented gestures are beeing checked
        let controller = window.Leap.loop({ enableGestures: true }, () => {
            let frame = controller.frame(15);
            if (frame.valid && frame.gestures.length > 0) {
                this.leapGestures(frame)
            } else {
                this.ourGestures(frame)
            }
        });
    }
    /**
     * Checks if there is no current gesture recognized
     * Checks if Leapjs has recognized gestures
     * If no gesture from Leapjs has been recognized self-implemented gesture are checked
     * @param {*} frame 
     * @returns 
     */
    gestures(frame) {
        if (!this.state.gestureDone) {
            if (frame.valid && frame.gestures.length > 0 && frame.hands.length > 0) {
                this.leapGestures(frame);
                return;
            } else {
                this.ourGestures(frame)
            }
        }


    }
    /**
     * Function for distinguishing gestures from Leap-Motion-API
     * Checks if gesture is a swipe or circle
     * Blocks other gestures during the gesture-function execution
     * @param {*} frame 
     */
    leapGestures(frame) {
        frame.gestures.forEach((gesture) => {
            switch (gesture.type) {
                case "circle":
                    this.jump()
                    this.setState({ gestureDone: true });
                    setTimeout(() => { this.setState({ gestureDone: false }) }, 2000);
                    break;
                case "swipe":
                    // Classify swipe as either horizontal or vertical
                    var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
                    // Classify as right-left or up-down
                    if (isHorizontal && frame.hands[0] !== undefined && (frame.hands[0].direction[1] <= 0.7)) {
                        if (gesture.direction[0] > 0 && gesture.state === "stop") {
                            this.next();
                            this.setState({ gestureDone: true });
                            setTimeout(() => { this.setState({ gestureDone: false }) }, 1000);
                            return;
                        } else if (gesture.direction[0] <= 0 && gesture.state === "stop") {
                            this.previous();
                            this.setState({ gestureDone: true });
                            setTimeout(() => { this.setState({ gestureDone: false }) }, 1000);
                            return;
                        }
                    }
                    break;
                default:
                    break;
            }
        });
    }

    /**
     * Function for distinguishing self implemented gestures
     * Checks if gesture is a stop, volume-Up or volume-Down gesture
     * Blocks other gestures during the gesture-function execution
     * @param {*} frame 
     */
    ourGestures(frame) {
        if (frame.hands.length > 0 && !this.state.gestureDone) {
            frame.hands.forEach((hand) => {
                if (hand.direction[1] >= 0.9) {
                    setTimeout(() => { this.gestureStop(hand) }, 1000);
                    this.setState({ gestureDone: true });
                    setTimeout(() => { this.setState({ gestureDone: false }) }, 10000);
                    return;
                } else if (hand.palmPosition[1] >= this.state.currentPalmPosition + 1) {
                    this.gestureVolup(hand);
                } else if (hand.palmPosition[1] <= this.state.currentPalmPosition - 1) {
                    this.gestureVoldown(hand);
                }
            })
        } else if (frame.hands.length === 0 && this.state.gestureDone) {
            this.state.gestureDone = false;
        }
    }

    /**
     * Turns the Volume Up and set currentPalmPostion
     * @param {*} hand 
     */
    gestureVolup(hand) {
        this.volumeUp();
        this.setState({
            currentPalmPosition: hand.palmPosition[1]
        });
    }

    /**
     * Turns the Volume Down and set currentPalmPostion
     * @param {*} hand 
     */
    gestureVoldown(hand) {
        this.volumeDown();
        this.setState({
            currentPalmPosition: hand.palmPosition[1]
        });
    }

    /**
     * Stops the Track
     * Check if Y-Direction of Hand is greater than 0.8 for more than 2 seconds
     * @param {*} hand 
     */
    gestureStop(hand) {
        this.state.timeVisible = hand.timeVisible;
        this.state.gestureDone = true;
        setTimeout(() => {
            if (hand.direction[1] >= 0.8) {
                this.stop();
                setTimeout(() => {
                    this.state.gestureDone = false;
                }, 2000);
            }
        }, 1);
    }

    /**
     * Turns the Volume Down
     */
    volumeDown() {
        this.state.player.getVolume().then(volume => {
            if ((volume - 0.01) > 0) {
                this.state.player.setVolume(volume - 0.01);
            }
        });
    }

    /**
     * Turns the Volume Up 
     */
    volumeUp() {
        this.state.player.getVolume().then(volume => {
            if ((volume + 0.01) < 1) {
                this.state.player.setVolume(volume + 0.01);
            }
        });
    }

    /**
     * Stop or Start the current track
     */
    stop() {
        this.state.player.togglePlay();
    }

    /**
     * Get the next track
     */
    next() {
        this.state.player.nextTrack();
    }

    /**
     * Get the previous track
     */
    previous() {
        this.state.player.previousTrack();
    }

    /**
     * Jumps to a given second in track
     * @returns 
     */
    jump() {
        if (this.state.position) {
            this.state.player.seek(this.state.position + 10000);
            return;
        }
    }

    /**
     * Render Function for the View
     * Shows the Cover-Image, Title and Artist of the current song
     * @returns 
     */
    render() {
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
                </div>
            </div>
        );
    }
}
export default MusicPlayerComponent;