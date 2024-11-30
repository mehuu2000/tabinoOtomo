import React from 'react';
//import { useState, useEffect } from 'react';
// import Box from '@mui/material/Box';
import styles from "../login/login.module.css";
import Header_c from "../../../components/header_c";
import Login_c from '../../../components/login_c';
import Footer_c from "../../../components/footer_c";



export default function LoginPage() {
  return (
    <>
      <div className={styles.main}>
          <Header_c />
          <Login_c />
          <Footer_c />
      </div>
    </>
  );
}