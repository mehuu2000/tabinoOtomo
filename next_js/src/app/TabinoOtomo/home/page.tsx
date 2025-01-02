'use client'

import React, { useState, useEffect } from "react";

import styles from "./home.module.css";
import SideBar_c from "../../../components/sideBar_c";

import { useApp } from './appContext';

// import dynamic from 'next/dynamic';
// import NowLoading_c from "../../../components/nowLoading_c";

// import Plan_c from '../../../components/plan_c';
// import Search_c from '../../../components/search_c';
// import Memo_c from '../../../components/memo_c';
// import Inquiry_c from '../../../components/inquiry_c';
// import Setting_c from '../../../components/setting_c';
// import NotFound_c from '../../../components/notFound_c';

// const Plan_c = dynamic(() => import('../../../components/plan_c'), {
//     loading: () => <NowLoading_c />, // ローディング中に表示する要素
// });
// const Search_c = dynamic(() => import("../../../components/search_c"));

// import Memo_c from '../../../components/memo_c';
// // const Memo_c = dynamic(() => import("../../../components/memo_c"), {
// //     loading: () => <NowLoading_c />, // ローディング中に表示する要素
// // });

// const Inquiry_c = dynamic(() => import("../../../components/inquiry_c"), {
//     loading: () => <NowLoading_c />, // ローディング中に表示する要素
// });
// const Setting_c = dynamic(() => import("../../../components/setting_c"), {
//     loading: () => <NowLoading_c />, // ローディング中に表示する要素
// });
// const NotFound_c = dynamic(() => import("../../../components/notFound_c"), {
//     loading: () => <NowLoading_c />, // ローディング中に表示する要素
// });

export default function Main() {
    // const { select, setSelect, displayContent } = useApp();
    const { displayContent } = useApp();

    return (
      <>
        <div className={styles.main}>
            <div className={styles.sideBar}>
                <SideBar_c />
                <div className={styles.contents}>
                    {displayContent()}
                </div>
            </div>
        </div>
      </>
    );
}