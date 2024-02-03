import React, { useContext, useEffect, useState } from "react";
import Item from "./Item";
import axios from "axios";
import { authContext } from "../context/AuthContext";

function Gallery(props) {
  const [items, setItems] = useState([]);
  const { userId, setUserId } = useContext(authContext);

  async function fetchNFTs() {
    if (props.role == "collection" && userId) {
      try {
        const response = await axios.get("http://localhost:3001/nfts", {
          params: {
            userId: userId,
          },
        });
        const userNFTs = response.data;
        // Map over the user's collection and create Item components
        const itemComponents = userNFTs.map((nft) => (
          <Item
            id={nft.nftId}
            key={nft.nftId}
            role={props.role}
            name={nft.name}
            status={nft.status}
            price={nft.price}
            path={`http://localhost:3001/${nft.path}`}
          />
        ));

        setItems(itemComponents);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      }
    } else if (props.role == "discover") {
      try {
        const response = await axios.get(
          "http://localhost:3001/all-listed-nfts"
        );

        const allListedNFTs = response.data.listedNFTs;
        // console.log("All Listed NFTs:", allListedNFTs);
        const itemComponents = allListedNFTs.map((nft) => (
          <Item
            id={nft.nftId}
            key={nft.nftId}
            role={props.role}
            name={nft.name}
            status={nft.status}
            price={nft.price}
            path={`http://localhost:3001/${nft.path}`}
          />
        ));

        setItems(itemComponents);
        // Do something with the listed NFTs, e.g., display them in your component
      } catch (error) {
        console.error("Error fetching all listed NFTs:", error);
      }
    }
  }

  useEffect(() => {
    fetchNFTs();
  }, [props.role]);

  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3 text-white">{props.title}</h3>
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
