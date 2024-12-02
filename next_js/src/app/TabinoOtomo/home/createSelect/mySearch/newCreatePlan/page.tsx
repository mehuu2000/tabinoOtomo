'use client'

import React, { useState } from 'react'
import styles from './page.module.css';

import Header_c from '../../../../../../components/header_c';
import MySearch_c from '../../../../../../components/mySearch_c';
import Footer_c from '../../../../../../components/footer_c';

export default function MySearch() {

  const [goTo, setGoTo] = useState<string>("");
  const [when, setWhen] = useState<string>("");
  const [days, setDays] = useState<string>("");

  const displayMySearch = () => {
    console.log("行き先:", goTo);
    console.log("いつから:", when);
    console.log("何日間:", days);
  };

  return (
    <div className={styles.main}>
        <Header_c />
        <MySearch_c 
          goTo={goTo} setGoTo={setGoTo} 
          when={when} setWhen={setWhen} 
          days={days} setDays={setDays} 
          displayMySearch={displayMySearch}
        />
        <Footer_c />
    </div>
  )
}