import React from 'react';
import networking from '../../networking/bathroom.jsx';

class Bathroom extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      location: {
        coordinates: [],
        street: "",
        city: "",
        state: "",
        zip: "",
        buildingName: "",
        locatingDetails: ""
      },
      currentMode: false
    };
  }

  upForm(id, evt){
    let val = evt.target.value;
    let location = this.state.location;
    location[id] = val;
    this.setState({
      location: location
    });
    console.log(this.state);
  }

  submit(){

    if(!this.state.currentMode){
      let _ = this.state.location;
      let toSend;
      let address = `${_.street}, ${_.city}, ${_.state} ${_.zip}`;
      toSend = Object.assign(this.state, {address: address});
      networking.add(toSend, (err, res) => {
        if(!err) console.log(res);
      });
    } else {
      this.addFromCurrent();
    }
    
  }

  currentMode(){
    this.setState({
      currentMode: true
    });
  }

  addFromCurrent(){
    let self = this;
    navigator.geolocation.getCurrentPosition((pos) => {
      let coords = [pos.coords.latitude, pos.coords.longitude];
      networking.add({
        coords: coords,
        buildingName: self.state.buildingName,
        locatingDetails: self.state.locationDetails
      }, (res) => {
        console.log(res);
        self.props.history.push('/');
      });
    });
  }

  render(){
    return (
      <div className="ui container">
        <form className="ui form">
          <div className="ui dividing header">Verify the Location of a Bathroom</div>
         
          <div className="ui segment">

            <div className="ui header">Use Current Location</div>
            <div className="sixteen wide field">
              <a onClick={()=>this.currentMode()} className="ui icon basic button">
                <i className="location arrow icon"></i>
              </a>
            </div>

            {
              !this.state.currentMode &&
              <div>
                <div className="ui horizontal divider">
                Or
                </div>

              <div className="ui header">Insert Address Manually</div>
              <div className="sixteen wide fields">
                <div className="ten wide field">
                  <input id="street" type="text" onChange={(e)=>this.upForm("street",e)}/>
                  <label htmlFor="street">Street Address</label>
                </div>
                <div className="six wide field">
                  <input id="city" type="text" onChange={(e)=>this.upForm("city",e)}/>
                  <label htmlFor="city">City</label>
                </div>
                <div className="ten wide field">
                  <input id="state" type="text" className="validate" onChange={(e)=>this.upForm("state",e)}/>
                  <label htmlFor="state">State</label>
                </div>
                <div className="six wide field">
                  <input id="zip" type="text" className="validate" onChange={(e)=>this.upForm("zip",e)}/>
                  <label htmlFor="zip">Zip Code</label>
                </div>
              </div>
              </div>
            }
          </div>

          <div className="sixteen wide field">
            <input id="buildingName" type="text" className="validate" onChange={(e)=>this.upForm("buildingName",e)}/>
            <label htmlFor="buildingName">Building Name</label>
          </div>

          <div className="sixteen wide field">
            <textarea id="locatingDetails" className="materialize-textarea" onChange={(e)=>this.upForm("locatingDetails",e)}>
            </textarea>
            <label htmlFor="locatingDetails">Locating Details</label>
          </div>

          <button onClick={()=>this.submit()} className="ui blue basic button">Submit</button>
        </form>
      </div>      
    );
  }
}

module.exports = Bathroom;