import React, { useEffect, useState } from "react";
import NowLoading from "./nowLoading_c";
import styles from "../components/module_css/search_c.module.css";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';

interface SpotData {
    spots: Spot[],
    pagination: {
        total: number;
        pageSize: number;
        currentPage: number;
        totalPages: number;
    }
}

interface Spot {
    id: number;
    name: string;
    prectures: string;
    description: string;
    imageUrl: string;
    updatedAt: Date;
}

export default function Plan_c() {
    const [spotData, setSpotData] = useState<SpotData>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [keyName, setKeyname] = useState<string>("");
    const [searchInput, setSearchInput] = useState<string>("");
    const [isGenerate, setIsGenerate] = useState<boolean>(false);
    const [isSwitch, setIsSwitch] = useState<boolean>(false);
    // const [searchError, setSearchError] = useState<string>("");
    const label = { inputProps: { 'aria-label': 'Switch demo' } };


    // スポットデータの取得
    const fetchSpots = async (page: number = 1, keyword: string = "") => {
        if (
            spotData &&
            spotData.pagination.currentPage === page &&
            keyName === keyword
        ) {
            alert("すでに表示済みです");
            return; // 既存のデータを使用
        }
        
        setIsLoading(true);
        setError(null);

        try {
            let url = `/api/getSpots?page=${page}`
            if(keyword) {
                url += `&keyName=${keyword}`;
            }

            const response = await fetch(url);

            if(!response.ok) {
                throw new Error('データの取得に失敗しました');
            }

            const data = await response.json() as SpotData;
            setSpotData(data);
            setCurrentPage(data.pagination.currentPage);
            setKeyname(keyword);
            setSearchInput("");
            console.log(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'データの取得中にエラーが発生しました');
            console.error('スポットデータ取得エラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 検索実行
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchSpots(1, searchInput);
    }

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsSwitch(event.target.checked);
        // AI提案の処理をここに追加
        console.log("AI提案:", event.target.checked);
    }

    // ページ変更
    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
        fetchSpots(page, keyName);
    }

    // 初回レンダリング時のスポットデータ取得
    useEffect(() => {
        if(!isGenerate) {
            fetchSpots();
            setIsGenerate(true);
        }
    }, [isGenerate]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!spotData || isLoading) {
        return <NowLoading />;
    }

    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchHeader}>
                <h1 className={styles.pageTitle}>旅行先検索</h1>
                
                {/* 検索フォーム */}
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder={isSwitch ? "どんな旅行先をお探しですか？" : "スポット名や都道府県名で検索"}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>検索</button>
                </form>
            </div>
            <div className={styles.switchContainer}>
                <p>AI提案</p>
                <Switch onChange={handleSwitchChange} value={isSwitch}/>
                {isSwitch && <p className="text-red-500 ml-2.5">検索に時間がかかります</p>}
            </div>

            {/* 検索結果情報 */}
            <div className={styles.resultInfo}>
                {keyName ? (
                    <p>「{keyName}」の検索結果: {spotData.pagination.total}件</p>
                ) : (
                    <p>全{spotData.pagination.total}件のスポット</p>
                )}
            </div>
            
            {/* スポット一覧 */}
            <div>
                {spotData.spots.length > 0 ? (
                    <div className={styles.spotsGrid}>
                        {spotData.spots.map((spot) => (
                            <div key={spot.id} className={styles.spotCard}>
                                <div className={styles.imageContainer}>
                                    <img 
                                        src={spot.imageUrl} 
                                        alt={spot.name} 
                                        className={styles.spotImage}
                                        width={300}
                                        height={200}
                                    />
                                </div>
                                <div className={styles.spotInfo}>
                                    <h3 className={styles.spotName}>{spot.name}</h3>
                                    <p className={styles.spotPrefecture}>{spot.prectures}</p>
                                    <p className={styles.spotDescription}>
                                        {spot.description.length > 100 
                                            ? `${spot.description.substring(0, 100)}...` 
                                            : spot.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noResults}>
                        <p>スポットが見つかりませんでした</p>
                    </div>
                )}
                
                {/* ページネーション */}
                {/* <div className={styles.pagination}> */}
                    {/* 「前へ」ボタン */}
                    {/* <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className={styles.pageButton}
                    >
                        前へ
                    </button> */}
                    
                    {/* 単一ページでもページ番号を表示 */}
                    {/* <button 
                        onClick={() => handlePageChange(1)}
                        className={`${styles.pageButton} ${styles.activePage}`}
                    >
                        1
                    </button> */}
                    
                    {/* 複数ページがある場合のみ、追加のページネーション表示 */}
                    {/* {spotData.pagination.totalPages > 1 && (() => {
                        // ここから既存のページネーションコードを利用
                        const totalPages = spotData.pagination.totalPages;
                        const pages = [];
                        
                        // 省略記号や中間ページの表示を決定
                        if (totalPages <= 5) {
                            // 5ページ以下の場合はシンプルに2ページ目以降を表示（1ページ目は既に表示済み）
                            for (let i = 2; i <= totalPages; i++) {
                                pages.push(
                                    <button 
                                        key={i}
                                        onClick={() => handlePageChange(i)}
                                        className={`${styles.pageButton} ${currentPage === i ? styles.activePage : ''}`}
                                    >
                                        {i}
                                    </button>
                                );
                            }
                        } else {
                            // 6ページ以上の場合は省略表示（既存のロジックをそのまま使用）
                            if (currentPage > 3) {
                                pages.push(<span key="ellipsis1" className={styles.ellipsis}>...</span>);
                            }
                            
                            const startPage = Math.max(2, currentPage - 1);
                            const endPage = Math.min(totalPages - 1, currentPage + 1);
                            
                            for (let i = startPage; i <= endPage; i++) {
                                if (i < totalPages) {
                                    pages.push(
                                        <button 
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            className={`${styles.pageButton} ${currentPage === i ? styles.activePage : ''}`}
                                        >
                                            {i}
                                        </button>
                                    );
                                }
                            }
                            
                            if (currentPage < totalPages - 2) {
                                pages.push(<span key="ellipsis2" className={styles.ellipsis}>...</span>);
                            }
                            
                            // 最終ページは常に表示（totalPagesが2以上の場合）
                            pages.push(
                                <button 
                                    key={totalPages}
                                    onClick={() => handlePageChange(totalPages)}
                                    className={`${styles.pageButton} ${currentPage === totalPages ? styles.activePage : ''}`}
                                >
                                    {totalPages}
                                </button>
                            );
                        }
                        
                        return pages;
                    })()} */}
                    
                    {/* 「次へ」ボタン */}
                    {/* <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === spotData.pagination.totalPages}
                        className={styles.pageButton}
                    >
                        次へ
                    </button> */}
                {/* </div> */}
                <div className={styles.paginationContainer}>
                    <Stack spacing={2} alignItems="center">
                        <Pagination 
                            count={spotData.pagination.totalPages} 
                            page={currentPage}
                            onChange={handlePageChange}
                            variant="outlined" 
                            color="primary"
                            showFirstButton 
                            showLastButton
                            siblingCount={1}
                            boundaryCount={1}
                            disabled={isLoading}
                        />
                    </Stack>
                </div>
            </div>
            
        </div>
    );
}
