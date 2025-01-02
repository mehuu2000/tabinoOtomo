'use client'

import React from 'react'
import MemoList_c from './memoList_c';
import OtherFunc_u from './UI/otherFunc_u';
import styles from './module_css/memo_c.module.css';

type Memo_cProps = {
    session: { user: { id: string } } | null; // sessionの型を定義
};

export default function Memo_c({ session }: Memo_cProps) {
    return(
        <div className={styles.main}>
            <MemoList_c />
            <OtherFunc_u />
        </div>
    )

}