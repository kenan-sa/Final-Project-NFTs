import axios from "axios";
import React, { useState, useRef, useContext } from "react";
import { authContext } from "../context/AuthContext";
// import { useFormState } from "react-hook-form";
// import { useFormStatus } from "react-dom";
// import Item from "./Item";

function Minter() {
  // const { pending, data } = useFormStatus();
  // const [handleSubmit,setHandelSubmit]=useFormState();
  const imgRef = useRef();
  const nameRef = useRef();
  const [nftPrincipal, setNFTPrincipal] = useState("");
  const [loaderHidden, setLoaderHidden] = useState(true);
  const { userId, setUserId } = useContext(authContext);

  async function onSubmit() {
    setLoaderHidden(false);
    console.log("img :" + JSON.stringify(imgRef.current.value));
    console.log("name :" + JSON.stringify(nameRef.current.value));
    const img = imgRef.current.files[0];
    const imageArray = await img.arrayBuffer();
    const arr = [...new Uint8Array(imageArray)];
    const formData = new FormData();
    formData.append("buffer", img);
    formData.append("name", nameRef.current.value);
    formData.append("userId", userId);
    const response = await axios.post("http://localhost:3001/mint", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response.data);

    // const name = data?.get("name");
    // const image = data?.get("image");
    // console.log("name : " + name);
    // console.log("image : " + image);
    // const imageArray = await image.arrayBuffer();
    // const imageByteData = [...new xUint8Array(imageArray)];
    // const newNFTID = await opend.mint(imageByteData, name);
    // console.log(newNFTID.toText());
    // setNFTPrincipal(newNFTID);
    setLoaderHidden(true);
  }

  if (nftPrincipal === "") {
    return (
      <div className="minter-container">
        <div hidden={loaderHidden} className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <h3 className="makeStyles-title-99 Typography-h3 form-Typography-gutterBottom text-white">
          Create NFT
        </h3>
        <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom text-white">
          Upload Image
        </h6>
        <form className="makeStyles-form-109" noValidate="" autoComplete="off">
          <div className="upload-container">
            <input
              // {...register("image", { required: true })}
              ref={imgRef}
              className="upload text-white"
              type="file"
              accept="image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp"
            />
          </div>
          <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom text-white">
            Collection Name
          </h6>
          <div className="form-FormControl-root form-TextField-root form-FormControl-marginNormal form-FormControl-fullWidth">
            <div className="form-InputBase-root form-OutlinedInput-root form-InputBase-fullWidth form-InputBase-formControl">
              <input
                // {...register("name", { required: true })}
                ref={nameRef}
                placeholder="e.g. CryptoDunks"
                type="text"
                className="form-InputBase-input form-OutlinedInput-input text-white"
              />
              <fieldset className="PrivateNotchedOutline-root-60 form-OutlinedInput-notchedOutline"></fieldset>
            </div>
          </div>
          <div className="form-ButtonBase-root form-Chip-root makeStyles-chipBlue-108 form-Chip-clickable">
            <span onClick={onSubmit} className="form-Chip-label">
              Mint NFT
            </span>
          </div>
        </form>
      </div>
    );
  } else {
    return (
      <div className="minter-container">
        <h3 className="Typography-root makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
          Minted!
        </h3>
        <div className="horizontal-center">
          {/* <Item id={nftPrincipal.toText()} /> */}
        </div>
      </div>
    );
  }
}

export default Minter;
