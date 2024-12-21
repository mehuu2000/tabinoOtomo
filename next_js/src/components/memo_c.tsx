'use client'

import React from 'react'
import MemoList_c from './memoList_c';
import OtherFunc_u from './UI/otherFunc_u';
import styles from './module_css/memo_c.module.css';

export default function Memo_c() {
    return(
        <div className={styles.main}>
            <MemoList_c />
            <OtherFunc_u />
        </div>
    )

}