import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Button from "./Button";
import { authContext } from "../context/AuthContext";
import PriceLabel from "./PriceLabel";

function Item(props) {
  const [nftName, setNFTName] = useState();
  const [nftOwner, setNFTOwner] = useState();
  const [nftOriginalOwner, setNFTOriginalOwner] = useState();
  const [nftOwnerId, setNFTOwnerId] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [priceLabel, setPriceLabel] = useState();
  const [shouldDisplay, setDisplay] = useState(true);

  const { userId, setUserId } = useContext(authContext);

  const nftId = props.id;

  async function loadNFT() {
    //*get the user from the dataBase by the nftID
    try {
      const response = await axios.get("http://localhost:3001/owner", {
        params: {
          nftId: nftId,
        },
      });

      // setNFTOriginalOwner(response.data.owner);
      setNFTOwnerId(response.data.ownerId);
      setNFTOwner(response.data.owner);
    } catch (error) {
      console.error("There is no owner of that nft", error);
    }
    setNFTName(props.name);
    setImage(props.path);

    if (props.role == "collection") {
      if (props.status == "listed") {
        setNFTOwner("CosmoNexus");
        setBlur({ filter: "blur(4px)" });
        setSellStatus("Listed");
        setButton();
        setPriceLabel();
      } else if (props.status == "owned") {
        setButton(<Button handleClick={handleSell} text={"Sell"} />);
      }
    } else if (props.role == "discover") {
      //*get the original owner of the nft to render on the discover page
      if (nftOwnerId != userId) {
        setBlur();
        setSellStatus("");
        setButton(<Button handleClick={handleBuy} text={"Buy"} />);
      } else {
        setBlur();
        setSellStatus("");
        setButton();
      }
      try {
        const response = await axios.get("http://localhost:3001/price", {
          params: {
            nftId: nftId,
          },
        });
        const price = response.data.price;
        setPriceLabel(<PriceLabel sellPrice={price.toString()} />);
      } catch (error) {
        console.error("There is no nft to that nftId", error);
      }
    }
  }

  useEffect(() => {
    loadNFT();
  }, [props.role]);

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
  // try {
  //   const response = await axios.post("http://localhost:3001/transfer", {
  //     senderUserId: userId,
  //     receiverUserId: nftOwnerId,
  //     amount: price,
  //   });

  //   console.log("transfer: " + response.data.message);
  //   const transferSuccess = response.data.success;
  //   if (transferSuccess) {

  //       }
  //     } catch (error) {
  //       console.error("Error transferring tokens:", error);
  //     }
  //   }
  //
  //.................................................................................... buy
  async function handleBuy() {
    console.log("Buy was triggered");
    setLoaderHidden(false);
    // const tokenActor = await Actor.createActor(tokenIdlFactory, {
    //   agent,
    //   canisterId: Principal.fromText("<REPLACE WITH YOUR TOKEN CANISTER ID>"),
    // });
    // const sellerId = await opend.getOriginalOwner(props.id);
    // const itemPrice = await opend.getListedNFTPrice(props.id);
    // const result = await tokenActor.transfer(sellerId, itemPrice);
    // if (result == "Success") {
    //   const transferResult = await opend.completePurchase(
    //     props.id,
    //     sellerId,
    //     CURRENT_USER_ID
    //   );
    // console.log("purchase: " + transferResult);
    setLoaderHidden(true);
    setDisplay(false);
    // }
  }

  return (
    <div
      style={{ display: shouldDisplay ? "inline" : "none" }}
      className="disGrid-item"
    >
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
          onError={(e) => console.error("Error loading image:", e)}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
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
