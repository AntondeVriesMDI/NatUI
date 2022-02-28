import React from 'react';
/**
 * Shows the Login-View of Spotify
 */
class LoginComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * Redirect to Login Page from Spotify-API
     * @returns 
     */
    render(){
       return( <div className="App">
            <header className="App-header">
                <a className="btn-spotify" href="/auth/login" >
                    Login with Spotify 
                </a>
                
            </header>
        </div>
       );}
}
export default  LoginComponent;