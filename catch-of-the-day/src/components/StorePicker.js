import React from 'react';
import { getFunName } from '../helpers';

class StorePicker extends React.Component {
  render() {
    return(
      <form className="store-selector">
        { /* this is the form */ }
        <h2>Please enter a store</h2>
        <input type="text" required placeholder="Store name" defaultValue={getFunName()}></input>
        <button type="submit">Visit Store</button>
      </form>
    )
  }
}

export default StorePicker;
