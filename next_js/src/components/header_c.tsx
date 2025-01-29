'use client'

import React from 'react';
import styles from './module_css/header_c.module.css';
import Menu from './navigation/Menu';

import { User } from '@prisma/client'
import Link from 'next/link'

type Header_cProps = {
  currentUser: User | null
}

const Header_c: React.FC<Header_cProps> = ({ currentUser }) => {
  return (
    <header className={styles.header} >
      <span></span>
      <Link href="/TabinoOtomo/home" className={styles.h1}>
          たびとも
      </Link>

      <div className="flex items-center justify-center space-x-2">
          <Menu currentUser={currentUser} />
      </div>
    </header>
  );
}

export default Header_c