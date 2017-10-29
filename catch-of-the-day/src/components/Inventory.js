import React from 'react';
import AddFishForm from './AddFishForm';
import base from '../base';

class Inventory extends React.Component {

  constructor(){
    super();
    this.renderInventory = this.renderInventory.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderLogin = this.renderLogin.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.logout = this.logout.bind(this);
    this.authHandler = this.authHandler.bind(this);
    this.state = {
      uid: null,
      owner: null,
    }
  }

  componentDidMount(){
    base.onAuth((user) => {
      if(user) {
        this.authHandler({user})
      }
    })
  }

  handleChange(e, key) {
    const fish = this.props.fishes[key];
    const updatedFish = {
      ...fish,
      [e.target.name]: e.target.value
    }
    this.props.updateFish(key, updatedFish);
  }

  renderLogin(){
    return(
      <nav className="login">
        <p>Sign in to manage your store inventory</p>
        <button className="github" onClick={() => this.authenticate('github')}>Login with GitHub</button>
        <button className="facebook" onClick={() => this.authenticate('facebook')}>Login with Facebook</button>
        <button className="twitter" onClick={() => this.authenticate('twitter')}>Login with Twitter</button>
      </nav>
    )
  }

  logout(){
    base.unauth();
    this.setState({uid: null});
  }

  authenticate(provider) {
    const p = {
      github: new base.auth.GithubAuthProvider(),
      facebook: new base.auth.FacebookAuthProvider(),
      twitter: new base.auth.TwitterAuthProvider(),
    }[provider];

    base.auth().signInWithPopup(p).then(this.authHandler).catch(function(error) {
    	console.log(error);
    });
  }

  authHandler(authData){
    console.log(authData);
    const storeRef = base.database().ref(this.props.storeId)
    storeRef.once('value', (snapshot) => {
      const data = snapshot.val() || {}
      if(!data.owner) {
        storeRef.set({
          owner: authData.user.uid
        })
      }
      this.setState({
        uid: authData.user.uid,
        owner: data.owner || authData.user.uid

      })
    })
  }

  renderInventory(key){
    const fish = this.props.fishes[key];
    return(
      <div className="fish-edit" key={key}>
        <input type="text" name="name" value={fish.name} placeholder="Fish name" onChange={(e) => this.handleChange(e, key)} />
        <input type="text" name="price" value={fish.price} placeholder="Fish price" onChange={(e) => this.handleChange(e, key)} />
        <select name="status" value={fish.status} onChange={(e) => this.handleChange(e, key)}>
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>
        <textarea type="text" name="desc" value={fish.desc} placeholder="Fish desc" onChange={(e) => this.handleChange(e, key)}></textarea>
        <input type="text" name="image"  value={fish.image} placeholder="Fish image" onChange={(e) => this.handleChange(e, key)} />
        <button onClick={(e) => this.props.removeFish(key)}>Remove</button>
      </div>
    )
  }

  render() {
    const logout = <button onClick={this.logout}>Logout!</button>;
    if(!this.state.uid) {
      return(
        <div>{this.renderLogin()}</div>
      )
    }
    if(this.state.uid !== this.state.owner) {
      return(
        <div>
          <p>Sorry you are not the owner of this store!</p>
          {logout}
        </div>

      )
    }
    return(
      <div>
        <h2>Inventory</h2>
        {logout}
        {Object.keys(this.props.fishes).map(this.renderInventory)}
        <AddFishForm addFish={this.props.addFish}/>
        <button onClick={this.props.loadSamples}>Load sample fishes</button>
      </div>
    )
  }
}

Inventory.propTypes = {
  fishes: React.PropTypes.object.isRequired,
  addFish: React.PropTypes.func.isRequired,
  updateFish: React.PropTypes.func.isRequired,
  removeFish: React.PropTypes.func.isRequired,
  loadSamples: React.PropTypes.func.isRequired,
  storeId: React.PropTypes.string.isRequired,
};

export default Inventory;
