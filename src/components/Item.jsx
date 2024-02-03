import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Button from "./Button";
import { authContext } from "../context/AuthContext";
import PriceLabel from "./PriceLabel";
import { useNavigate } from "react-router-dom";

function Item(props) {
  const [nftName, setNFTName] = useState();
  const [nftOwner, setNFTOwner] = useState("");
  const [nftOwnerId, setNFTOwnerId] = useState("");
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [priceLabel, setPriceLabel] = useState();
  const [shouldDisplay, setDisplay] = useState(true);
  const nav = useNavigate();

  const { userId, setUserId } = useContext(authContext);

  const nftId = props.id;
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/owner", {
        params: {
          nftId: nftId,
        },
      });
      return response.data;
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const loadNFT = async () => {
      const response = await fetchData();
      console.log(response);
      setNFTOwnerId(response.ownerId);
      setNFTOwner(response.owner);
      setNFTName(props.name);
      setImage(props.path);
      setDisplay(true);
      if (props.role === "collection") {
        setBlur();
        setPriceLabel();
        if (props.status === "listed") {
          setNFTOwner("CosmoNexus");
          setBlur({ filter: "blur(4px)" });
          setSellStatus("Listed");
          setButton();
        } else if (props.status === "owned") {
          setButton(<Button handleClick={handleSell} text={"Sell"} />);
        }
      } else if (props.role === "discover" && props.status === "listed") {
        setBlur();
        setSellStatus("");
        console.log(response.ownerId);
        setPriceLabel(<PriceLabel sellPrice={props.price.toString()} />);
        if (response.ownerId !== userId) {
          setButton(
            <Button
              handleClick={() => handleBuy(userId, response.ownerId, nftId)} //rabeea.com
              text={"Buy"}
            />
          );
        }
      }
    };
    loadNFT();
  }, [props.role, userId]);
  let price;
  function handleSell() {
    console.log("Sell clicked");
    setPriceInput(
      <input
        placeholder="Price in KANMURU"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => (price = e.target.value)}
      />
    );
    setButton(<Button handleClick={sellItem} text={"Confirm"} />);
  }
  //................................................................................... sell
  async function sellItem() {
    setBlur({ filter: "blur(4px)" });
    setLoaderHidden(false);
    console.log("set price = " + price);
    // POST REQUEST to set the price of that nftid / nft .
    try {
      const response = await axios.post("http://localhost:3001/price", {
        nftId,
        price,
      });
      const listingMessage = response.data.message;
      const listingSuccess = response.data.success;
      console.log("listing: " + listingMessage);
      if (listingSuccess) {
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setNFTOwner("CosmoNexus");
        setSellStatus("Listed");
      }
    } catch (error) {
      console.error("Error setting price:", error);
    }
  }

  //.................................................................................... buy
  async function handleBuy(userID, nftOwnerID, nftID) {
    if (!userID) {
      alert("You must to signIn first");
    } else {
      console.log("Buy was triggered");
      setBlur({ filter: "brightness(0.5)" });
      setLoaderHidden(false);
      console.log(nftOwnerID);
      try {
        const response = await axios.post("http://localhost:3001/transfer", {
          senderUserId: userID,
          receiverUserId: nftOwnerID,
          nftId: nftID,
        });

        console.log("transfer: " + response.data.message);
        const transferSuccess = response.data.success;
        if (transferSuccess) {
          console.log("purchased ☻☺");
        }
      } catch (error) {
        console.error("Error transferring tokens:", error);
      }
      setLoaderHidden(true);
      setDisplay(false);
    }
  }

  return (
    <div
      style={{ display: shouldDisplay ? "inline" : "none" }}
      className="disGrid-item"
    >
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded df">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
          onError={(e) => console.error("Error loading image:", e)}
        />
        <div className="lds-ellipsis loader" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {nftName}
            <span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {nftOwner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
