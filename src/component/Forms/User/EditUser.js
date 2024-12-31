import React from 'react'
import Img from "../../../assets/work-in-progress.png";

function EditUser() {
  return (
    <>
    <div style={{display:"flex", flexDirection:"column", justifyContent:'center'}}>
      <div>
        <img src={Img} alt='progress Image' /> 
      </div>
      
      {/* <div style={{fontWeight:"bold", fontSize:"2rem"}}>Work IN Progress</div> */}

    </div>
      
    </>
    
  )
}

export default EditUser;