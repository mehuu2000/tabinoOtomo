import React from 'react';
import styles from './module_css/header_c.module.css';
import getCurrentUser from '@/app/actions/getCurentUser';
import Menu from './navigation/Menu';

// import { User } from '@prisma/client'

// import Menu from '@/app/components/navigation/Menu'
import Link from 'next/link'

// type NavigationProps = {
//   currentUser: User | null
// }

// const Navigation: React.FC<NavigationProps> = ({ currentUser }) => {
export default async function Header_c() {
  const currentUser = await getCurrentUser()
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