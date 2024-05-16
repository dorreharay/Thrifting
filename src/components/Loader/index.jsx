import React from "react";
import './styles.scss'

import Spinner from '../../assets/images/loader.svg?react'
// import Spinner from '../../assets/images/loader.svg'

function Loader(props) {
  const { size = 30, theme } = props

  return <Spinner className={`loader m-auto animate-spin ${theme}`} style={{ width: size, height: size }} />
}

export default Loader
