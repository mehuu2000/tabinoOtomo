'use client'

import React, { useState } from "react";
import dynamic from 'next/dynamic';

import styles from "./home.module.css";
import NowLoading_c from "../../../components/nowLoading_c";

import Header_c from "../../../components/header_c";
import SideBar_c from "../../../components/sideBar_c";
const Plan_c = dynamic(() => import('../../../components/plan_c'), {
    loading: () => <NowLoading_c />, // ローディング中に表示する要素
});
const Search_c = dynamic(() => import("../../../components/search_c"));
const Memo_c = dynamic(() => import("../../../components/memo_c"), {
    loading: () => <NowLoading_c />, // ローディング中に表示する要素
});
const Inquiry_c = dynamic(() => import("../../../components/inquiry_c"), {
    loading: () => <NowLoading_c />, // ローディング中に表示する要素
});
const Setting_c = dynamic(() => import("../../../components/setting_c"), {
    loading: () => <NowLoading_c />, // ローディング中に表示する要素
});
const NotFound_c = dynamic(() => import("../../../components/notFound_c"), {
    loading: () => <NowLoading_c />, // ローディング中に表示する要素
});
import Footer_c from "../../../components/footer_c";

export default function Main() {
    const [select, setSelect] = useState<string>("plan");

    const displayContent = () => {
        switch (select) {
            case "plan":
                return <Plan_c />;
            case "search":
                return <Search_c />;
            case "memo":
                return <Memo_c />;
            case "inquiry":
                return <Inquiry_c />;
            case "setting":
                return <Setting_c />;
            default:
                return <NotFound_c />;
        }
    };


    return (
      <>
        <div className={styles.main}>
            <Header_c />
            <div className={styles.sideBar}>
                <SideBar_c select={select} setSelect={setSelect} />
                <div className={styles.contents}>
                    {displayContent()}
                </div>
            </div>
            <Footer_c />
        </div>
      </>
    );
}