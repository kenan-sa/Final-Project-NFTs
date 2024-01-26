import React, { useEffect, useState } from "react";
import Item from "./Item";
import axios from "axios";

function Gallery(props) {
  const [items, setItems] = useState([]);

  async function fetchNFTs() {
    if (props.ids) {
      try {
        const response = await axios.get(`http://localhost:3001/collection?email=${props.email}`);
        const userCollection = response.data.collection;

        // Map over the user's collection and create Item components
        const itemComponents = userCollection.map((NFTId) => (
          <Item id={NFTId} key={NFTId.toText()} role={props.role} />
        ));

        setItems(itemComponents);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      }
    }
  }

  useEffect(() => {
    fetchNFTs();
  }, [props.ids, props.email, props.role]);

  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3>
      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
            {items}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
