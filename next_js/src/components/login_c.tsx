'use client';

import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import styles from '../app/TabinoOtomo/login/login.module.css';

export default function Login_c() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("")

  // onChangeで値を更新
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

    return (
      <div className={styles.login}>
        <div className={styles.content}>
          <h2 id="login">ログイン</h2>
          <label htmlFor="login">ログイン方法を選んでください</label>
          <div className={styles.mailPassword_Login} id="mailPassword">
            <TextField 
              id="emailId" 
              type="email" 
              label="mail" 
              variant="outlined" 
              value={email}
              onChange={handleEmailChange} 
              sx={{
                width: "100%",
                margin: "5px",
              }}
            />
            <TextField 
              id="passwordId" 
              type="password" 
              label="password" 
              variant="outlined" 
              value={password}
              onChange={handlePasswordChange}
              sx={{
                width: "100%",
                margin: "5px",
              }}
            />
          </div>
          <label htmlFor="mailPassword" className={styles.noAccount}>
            <p>アカウントを持っていないですか？新規作成</p>
          </label>
        </div>
      </div>
    );
}