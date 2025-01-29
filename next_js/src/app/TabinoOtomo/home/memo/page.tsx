import React, { useEffect } from 'react'
import Memo_c from '../../../../components/memo_c';
import styles from './page.module.css';
import { useSession } from 'next-auth/react';
// import getCurrentUser from "../../../actions/getCurentUser";

export default function Memo() {
  const { data: session, status } = useSession();
  console.log(session?.user.id);

  return (
    <div className={styles.main}>
      <Memo_c  session = { session }/>
    </div>
  );
}