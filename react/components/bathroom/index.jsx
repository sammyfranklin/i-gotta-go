import React from 'react';
import {Route} from 'react-router-dom';
import Add from './add.jsx';
import Review from './review.jsx';
import networking from '../../networking/bathroom.jsx';
import revNetworking from '../../networking/review.jsx';

class Bathroom extends React.Component {
  constructor(props){
    super(props);

    this.state = this.getState();
  }
  getState(){
    let s = {
      id: this.props.match.params[0],
      bathroom: {},
      loading: true,
      verified: this.props.match.path.substring(0, 2) !== '/u',
      review: {
        text: "",
        rating: 0
      },
      all: false
    };
    console.log(s);
    if(s.verified) this.getBathroom(s);
    else this.getGBathroom(s);
    return s;
  }
  componentDidMount(){
    $('.ui.modal').modal();
    $('.ui.rating').rating();
  }
  componentDidUpdate(){
    $('.ui.checkbox').checkbox();
  }
  getGBathroom(state){
    let self = this;
    networking.gGet(state.id, res => {
      console.log(res);
      self.setState({
        bathroom: res,
        loading:false
      });
      self.markMap();
    });
  }
  getBathroom(state){
    let self = this;
    networking.get(state.id, (res) => {
      console.log(res);
      self.setState({
        bathroom: res,
        loading:false
      });
      if(res.allGender) $('#allGender').checkbox('set checked');
      self.markMap();
    });
  }
  markMap(){
    let self = this;
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
      L.mapquest.key = 'QwMOrkHNGKtPozliUHoqCWalFbaJG8mp';
      let myPos = [position.coords.latitude, position.coords.longitude];
      let map = L.mapquest.map('map', {
        center: myPos,
        layers: L.mapquest.tileLayer('map'),
        zoom: 16
      });
      //ME
      L.marker(myPos, {
        icon: L.mapquest.icons.via({
          primaryColor: '#47adf8',
          secondaryColor: '#ffffff',
          shadow: true,
          size: 'lg'
        })
      }).addTo(map);
      //BATHROOM
      let br = self.state.bathroom;
      let coords;
      if(self.state.verified){
        coords = br.location.coordinates;
      } else {
        let curr = br.geometry.location;
        coords = [curr.lat, curr.lng];
      }
      L.marker(coords, {
        icon: L.mapquest.icons.marker({
          primaryColor: self.state.verified ? "#33ff33" : "#aaaaaa",
          secondaryColor: self.state.verified ? "#aaffaa" : "#ffffff",
          shadow: true,
          size: 'lg'
        })
      }).addTo(map);

    });
  }

  eachReview(review, i){
    return(
      <Review key={i}>{review}</Review>
    );
  }

  upForm(prop, e){
    console.log();
    let review = this.state.review;
    review[prop] = e.target.value;
    this.setState({
      review: review
    });
  }
  submitReview(){
    let data = Object.assign(this.state.review, {
      rating: $('#rating').rating('get rating'),
      wouldRecommend: $('#wouldRecommend').checkbox('is checked'),
      pooped: $('#pooped').checkbox('is checked')
    });
    console.log("SENDING",data);
    let self = this;
    revNetworking.post(this.state.id, data, (res) => {
      let bathroom = self.state.bathroom;
      console.log(bathroom);
      bathroom.reviews.push(res);
      console.log(bathroom);
      self.setState({
        bathroom: bathroom
      });
      console.log(res);
    });
  }
  render(){
    return(
      <div>
        {this.state.loading ? this.renderLoader() : this.renderState()}
        <div className="ui basic modal">
        <div className="ui icon header">
          <i className="edit icon"></i>
          Make a Review
        </div>
        <div className="content">
          <form className="ui form">
            <div className="field">
              <p>Review</p>
              <input type="text" onChange={(e)=>this.upForm("text", e)}/>
            </div>
            <div className="inline fields">
              <div className="field">
                <label style={{color:"white"}}>Rating</label>
                <div id="rating"
                  className="ui star rating" data-rating="3" data-max-rating="5"
                  onChange={(e)=>this.upForm("rating", e)}
                />
              </div>
              <div className="field">
                <div className="ui checkbox" id="wouldRecommend">
                  <input type="checkbox" className="hidden"/>
                  <label style={{color:"white"}}>Would Recommend</label>
                </div>
              </div>
              <div className="field">
                <div className="ui checkbox" id="pooped">
                  <input type="checkbox" className="hidden"/>
                  <label style={{color:"white"}}>Did You Poop Here?</label>
                </div>
              </div>
              <div className="field">
                <label style={{color:"white"}}>Stall #</label>
                <input type="number" onChange={(e)=>this.upForm("stall", e)}/>
              </div>
            </div>
          </form>
        </div>
        <div className="actions">
          <div className="ui red basic cancel inverted button">
            <i className="remove icon"></i> Cancel
          </div>
          <div onClick={()=>this.submitReview()} className="ui green ok inverted button">
            <i className="checkmark icon"></i> Submit
          </div>
        </div>
      </div>
    </div>
    );
  }
  renderLoader(){
    return <div>Loading...</div>;
  }
  makeReview(){
    $('.ui.basic.modal')
      .modal('show')
    ;
    $('.ui.checkbox').checkbox();
    $('.ui.rating').rating();
  }
  allGender(){
    let val = $("#allGender").checkbox('is checked');
    console.log(val);
    networking.allGender(this.state.id, val, (res) => {
      //nothing
      console.log(res);
    });
  }
  renderState(){
    if(this.state.bathroom){
      let b = this.state.bathroom;
      if(this.state.verified){
        return (
          <div className="ui container">
            <div className="ui dividing header">{b.location.buildingName || b.location.formatted}</div>
            <div className="ui grid">
              <div className="eight wide column">
                <div className="sixteen wide column">
                  <div className="ui card">
                    <div className="content">
                      <div className="header">Location</div>
                      {b.location.formatted}
                    </div>
                    <div className="content">
                      <div className="header">Rating</div>
                      {
                        b.rating && b.rating.count > 0 ?
                        <div>
                          <div id="main-rating" className="ui rating" data-max-rating="5" data-rating={Math.ceil(b.rating.value)}></div>
                          ({b.rating.count})
                        </div>
                        :
                        <div>Not yet Rated</div>
                      }
                    </div>
                  </div>
                  <div className="ui form">
                      <div className="field">
                        <div id="allGender" className="ui checkbox toggle" onClick={()=>this.allGender()}>
                          <input type="checkbox" className="hidden"/>
                          <label>Is this an All Gender Restroom?</label>
                        </div>
                      </div>
                    </div>
                  <div className="ui horizontal divider"><i className="location arrow icon"></i></div>
                </div>
                <div className="sixteen wide column">
                  <div className="ui header">Locator</div>
                  <div className="ui segment">
                    <div id="map-container">
                      <div id="map"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="eight wide column">
                <div className="ui grid">
                  <div className="three column row">
                    <div className="left floated column">
                      <div className="ui header">Reviews</div>
                    </div>
                    <div className="right floated column">
                      <div onClick={()=>this.makeReview()} className="ui basic button">Add a Review</div>
                    </div>
                  </div>
                </div>
                
                <div className="ui segment">
                  {b.reviews.length === 0 ? 
                    <div>No reviews yet</div> :
                    <div className="ui items divided">
                      {b.reviews.map((r, i)=>this.eachReview(r, i))}
                    </div> 
                  }
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return(
          <div className="ui container">
            <div className="ui dividing header">{b.name}</div>
            <div className="ui text container segment">
              This bathroom is unverified, click here: if you would like to verify it:
              <button onClick={()=>this.verifyCurrent()} className="ui basic button">Verify</button>
            </div>
            <div id="map-container">
              <div id="map"></div>
            </div>
          </div>
        );
      }
    } else {
      return(
        <div></div>
      );
    }
  }


  verifyCurrent() {
    let curr = this.state.bathroom;
    let coords = curr.geometry.location;
    coords = [coords.lat, coords.lng];
    let self = this;
    networking.add({coords: coords, location: {buildingName: curr.name}, gId: curr.place_id}, bathroom => {
      bathroom.verified = true;
      console.log(bathroom);
      self.setState({
        bathroom: bathroom,
        verified: true,
        id: bathroom._id
      });
      console.log("Going to /b/"+bathroom._id);
      self.props.history.push('/b/'+bathroom._id);
      this.markMap();
    });
  }
}

module.exports = Bathroom;