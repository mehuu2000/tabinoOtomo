import React, { useEffect, useState } from "react";
// import NowLoading from "./nowLoading_c";
import Loading from "./Loading";
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
    // const label = { inputProps: { 'aria-label': 'Switch demo' } };


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

    // if (!spotData || isLoading) {
    //     return <Loading />;
    // }

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
                    <p>「{keyName}」の検索結果: {spotData?.pagination.total}件</p>
                ) : (
                    <p>全{spotData?.pagination.total}件のスポット</p>
                )}
            </div>
            
            {/* スポット一覧 */}
            {isLoading ? (
                <Loading />
            ) : (
                <div>
                {spotData && spotData.spots.length > 0 ? (
                    <div className={styles.spotsGrid}>
                        {spotData?.spots.map((spot) => (
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
                <div className={styles.paginationContainer}>
                    <Stack spacing={2} alignItems="center">
                        <Pagination 
                            count={spotData?.pagination.totalPages} 
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
            )}
            
            
        </div>
    );
}
