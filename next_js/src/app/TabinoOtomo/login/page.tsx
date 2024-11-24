import React from 'react';
//import { useState, useEffect } from 'react';
// import Box from '@mui/material/Box';
import styles from "../login/page.module.css";
import Header from "../../../components/header";
import Login from '../../../components/login';
import Footer from "../../../components/footer";



export default function LoginPage() {
  return (
    <>
        <div className={styles.main}>
            <Header />
            <Login />
            <Footer/>
        </div>
    </>
  );
}