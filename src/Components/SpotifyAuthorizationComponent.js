import React from 'react';
import LoginComponent from './LoginComponent';
import MusicPlayerComponent from './MusicPlayerComponent';
/**
 * Component to check if user has a valid login
 */
class SpotifyAuthorizationComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      token: ''
    };
  }

  async componentDidMount() {
    await this.getToken();
  }

  /**
   * Function to get the Token for SpotifyAPI-Requests
   * Saving Response from API in global var for other Components
   */
  async getToken() {
    const response = await fetch('/auth/token');
    const json = await response.json();
    this.setState({ token: json.access_token });
  }

  /**
   * Render Function for Component
   * Check of user already logged in
   * true => shows MusicPlayerComponent
   * false => shows LoginComponent
   * @returns 
   */

  render() {
    let component;
    if (this.state.token === '') {
      component = <LoginComponent />
    } else {
      component = <MusicPlayerComponent token={this.state.token} />
    }
    return (
      <>
        {component}
      </>

    );
  }

}
export default SpotifyAuthorizationComponent;