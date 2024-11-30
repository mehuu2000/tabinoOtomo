import React, { useEffect, useState } from "react";
import NowLoading from "./nowLoading_c";

export default function Plan_c() {
    const [data, setData] = useState<number[] | null>(null);

    useEffect(() => {
        // データ取得を擬似的に遅延させる
        const fetchData = async () => {
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒遅延
            const largeData = Array.from({ length: 1000000 }, (_, i) => i); // 100万件のデータ
            setData(largeData);
        };
        fetchData();
    }, []);

    if (!data) {
        return <NowLoading />;
    }

    return (
        <div>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
            <p>Searchですよ</p>
        </div>
    );
}
