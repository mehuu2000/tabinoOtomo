import React from 'react'
import Memo_c from '../../../../components/memo_c';
import Header_c from '../../../../components/header_c';
import Footer_c from '../../../../components/footer_c';
import styles from './page.module.css';

function page() {
  return (
    <div className={styles.main}>
        <Header_c />
        <Memo_c />
        <Footer_c />
    </div>
  )
}

export default page