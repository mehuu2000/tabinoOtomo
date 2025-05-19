'use client'

import React, { useState, useEffect } from 'react'
import { useAtomValue } from 'jotai';
import{ travelDataAtom } from '@/store/travelAtoms';
import styles from '@/components/module_css/planGeneration.module.css';
import Loading from "@/components/Loading";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SpotDetailPopup from '@/components/popUp';

// material-icons
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FmdBadIcon from '@mui/icons-material/FmdBad';

// material-uis
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Router } from 'next/router';

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
    updatedAt: string;
}

interface SelectedSpot extends Spot {
    day: number;  // 何日目のプランか
    order: number; // その日の中での順序
}

export default function PlanGeneration() {
    const travelData = useAtomValue(travelDataAtom);
    const [selectDay, setSelectDay] = useState(1);
    const [isSpotOpen, setIsSpotOpen] = useState(false);
    const [planName, setPlanName] = useState("");
    const [selectSpots, setSelectSpots] = useState<SelectedSpot[]>([]);

    const [spotData, setSpotData] = useState<SpotData>();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [keyName, setKeyname] = useState<string>("");
    const [searchInput, setSearchInput] = useState<string>("");
    const [isGenerate, setIsGenerate] = useState<boolean>(false);

    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [selectedSpotForPopup, setSelectedSpotForPopup] = useState<Spot | null>(null);
    const router = useRouter();

    // スポットデータの取得
    const fetchSpots = async (page: number = 1, keyword: string = "", prefecture: string = "") => {
        if (
            spotData &&
            spotData.pagination.currentPage === page &&
            keyName === keyword &&
            activeFilter === prefecture
        ) {
            alert("すでに表示済みです");
            return; // 既存のデータを使用
        }
        
        setIsLoading(true);
        setError(null);

        try {
            let url = `/api/getSpots?page=${page}`
            if(keyword) {
                url += `&keyName=${encodeURIComponent(keyword)}`;
            }
            if(prefecture && prefecture !== "all") {
                url += `&prefecture=${encodeURIComponent(prefecture)}`;
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
        fetchSpots(1, searchInput, activeFilter);
    }

    // フィルター変更時のハンドラ
    const handleFilterChange = (prefecture: string) => {
        setActiveFilter(prefecture);
        setCurrentPage(1);
        fetchSpots(1, keyName, prefecture);
    };

    // ページ更新時のハンドラ
    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
        fetchSpots(page, keyName, activeFilter);
    }

    // 保存ボタンのハンドラ
    const handleClickSavePlan = async () => {
        if (selectSpots.length === 0) {
            alert("スポットを選択してください");
            return;
        }
        if (!planName) {
            alert("計画名を入力してください");
            return;
        }
        try {
            setIsSaveLoading(true);
            
            // 旅行開始日をUNIXタイムスタンプに変換
            const whenDate = new Date(travelData.when);
            const fromWhenTimestamp = Math.floor(whenDate.getTime() / 1000);
            
            // 保存データの整形
            const planData = {
                title: planName,
                days: travelData.days,
                fromWhen: fromWhenTimestamp,
                isPublic: false,
                spots: selectSpots.map(spot => ({
                    spotId: spot.id,
                    day: spot.day,
                    order: spot.order
                }))
            };
            
            // APIリクエストを送信
            const response = await fetch('/api/planApi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(planData),
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                // バリデーションエラーの場合、詳細なエラーメッセージを表示
                if (result.errors) {
                    const errorMessages = Object.entries(result.errors)
                    .map(([field, messages]) => {
                        // messagesが配列かどうかを実行時に確認
                        const messageStr = Array.isArray(messages) 
                            ? messages.join(', ')
                            : String(messages); // 配列でない場合は文字列に変換
                        return `${field}: ${messageStr}`;
                    })
                        .join('\n');
                    throw new Error(`入力エラー:\n${errorMessages}`);
                }
                throw new Error(result.message || '計画の保存に失敗しました');
            }
            
            alert("プランを保存しました！");
            
            // 保存成功後、マイプランページに遷移
            router.push('/TabinoOtomo/home');
        } catch (error) {
            console.error('プラン保存エラー:', error);
            alert(error instanceof Error ? error.message : 'プランの保存に失敗しました。もう一度お試しください。');
        } finally {
            setIsSaveLoading(false);
        }
    }

    useEffect(() => {
        console.log(`選択されたスポット: ${JSON.stringify(selectSpots)}`);
    }, [selectSpots]);

    // スポットの追加処理
    const handleAddSpot = (spot: Spot) => {
        // 同じ日付、同じスポットIDの組み合わせがあるか確認
        if (!selectSpots.some(selected => selected.id === spot.id && selected.day === selectDay)) {
            // 現在の日付に対する順序を算出
            const spotsForCurrentDay = selectSpots.filter(s => s.day === selectDay);
            const newOrder = spotsForCurrentDay.length + 1;
            
            // 新しいスポットを追加（日付と順序情報を含む）
            setSelectSpots(prev => [...prev, {
                ...spot,
                day: selectDay,
                order: newOrder
            }]);
        } else {
            // すでに追加済みの場合、メッセージを表示
            alert('このスポットは選択した日付ですでに追加されています');
        }
    };

    // スポットの削除処理
    const handleRemoveSpot = (spotId: number, day: number) => {
        // 指定されたスポットを削除
        const newSpots = selectSpots.filter(spot => !(spot.id === spotId && spot.day === day));
        
        // 削除後、同じ日のスポットの順序を再計算
        const updatedSpots = newSpots.map(spot => {
            if (spot.day === day) {
                // 同じ日のスポットだけを抽出して順序付け
                const sameDaySpots = newSpots
                    .filter(s => s.day === day)
                    .sort((a, b) => a.order - b.order);
                
                // 新しい順序を割り当て
                const newOrder = sameDaySpots.findIndex(s => s.id === spot.id) + 1;
                return { ...spot, order: newOrder };
            }
            return spot;
        });
        
        setSelectSpots(updatedSpots);
    };

    // ポップアップを開くハンドラ
    const openSpotPopup = (spot: Spot) => {
        setSelectedSpotForPopup(spot);
    };

    // ポップアップを閉じるハンドラ
    const closeSpotPopup = () => {
        setSelectedSpotForPopup(null);
    };

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

    const destinations = travelData.goTo.filter(dest => dest !== '');

    return (
        <div className={styles.main}>
            <div className={styles.containers}>
                <div className={styles.head}>
                    <button 
                        className={`${isSpotOpen ? styles.openSpot : styles.closeSpot}`}
                        onClick={() => setIsSpotOpen(!isSpotOpen)}
                    >
                        {isSpotOpen ? (
                            <KeyboardArrowDownIcon sx={{ color: 'rgb(137, 68, 255)' }}/>
                        ) : (
                            <KeyboardArrowUpIcon sx={{ color: 'black' }}/>
                        )}
                    </button>
                    <input 
                        type="text" 
                        placeholder='計画名' value={planName} 
                        className={styles.planName} 
                        onChange={(e) => setPlanName(e.target.value)} 
                    />
                    <p className={styles.when}>{travelData.when} 〜</p>
                    <div className={styles.daysList}>
                        {Array.from({ length: travelData.days }, (_, i) => (
                            <button 
                                key={`day-${i + 1}`}
                                className={`${styles.dayButton} ${selectDay === i + 1 ? styles.dayButtonTrue : styles.dayButtonFalse}`}
                                onClick={() => setSelectDay(i + 1)}
                            >
                                <p>{i + 1}日目</p>
                            </button>
                        ))}
                    </div>
                    <button 
                        className={`${styles.saveButton} ${selectSpots.length > 0 ? styles.saveButtonTrue : styles.saveButtonFalse}`}
                        disabled={selectSpots.length == 0 || isSaveLoading}
                        onClick={handleClickSavePlan}
                        >{isSaveLoading ? "保存中..." : "保存"}
                    </button>
                </div>
                {isSpotOpen && (
                    <div className={styles.selectedSpots}>
                        {/* スポットが一つも選択されていない場合 */}
                        {selectSpots.length === 0 ? (
                            <div className={styles.noSelectSpots}>
                                <FmdBadIcon sx={{ color: 'rgb(137, 68, 255)' }} />
                                <p>スポットが選択されていません</p>
                            </div>
                        ) : (
                            /* 日付ごとにスポットを表示するセクション */
                            <div className={styles.daysContainer}>
                                {/* 日数分のタブを生成 */}
                                <div className={styles.dayTabs}>
                                    {Array.from({ length: travelData.days }, (_, i) => {
                                        const day = i + 1;
                                        const spotsCount = selectSpots.filter(spot => spot.day === day).length;
                                        return (
                                            <button
                                                key={`tab-day-${day}`}
                                                className={`${styles.dayTab} ${selectDay === day ? styles.activeTab : ''}`}
                                                onClick={() => setSelectDay(day)}
                                            >
                                                {day}日目 ({spotsCount})
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* 日ごとのスポット一覧 */}
                                <div className={styles.daySpotsList}>
                                    {Array.from({ length: travelData.days }, (_, i) => {
                                        const day = i + 1;
                                        const daySpots = selectSpots
                                            .filter(spot => spot.day === day)
                                            .sort((a, b) => a.order - b.order);
                                        
                                        return (
                                            <div 
                                                key={`spots-day-${day}`}
                                                className={`${styles.daySpotsGroup} ${selectDay === day ? styles.activeDaySpots : styles.hiddenDaySpots}`}
                                            >
                                                {daySpots.length === 0 ? (
                                                    <div className={styles.noSpotsForDay}>
                                                        <p><FmdBadIcon sx={{ color: 'rgb(137, 68, 255)' }} />{day}日目のスポットが選択されていません</p>
                                                    </div>
                                                ) : (
                                                    <div className={styles.spotsScrollContainer}>
                                                        {daySpots.map((spot, index) => (
                                                            <div key={`day-${day}-spot-${spot.id}`} className={styles.selectedSpotCard}>
                                                                <div className={styles.spotOrder}>{index + 1}</div>
                                                                <div className={styles.selectedSpotImage}>
                                                                    <Image 
                                                                        src={spot.imageUrl} 
                                                                        alt={spot.name} 
                                                                        width={120}
                                                                        height={80}
                                                                        className={styles.selectedImg}
                                                                    />
                                                                </div>
                                                                <div className={styles.selectedSpotInfo}>
                                                                    <h4>{spot.name}</h4>
                                                                    <p>{spot.prectures}</p>
                                                                </div>
                                                                <button 
                                                                    className={styles.removeButton}
                                                                    onClick={() => handleRemoveSpot(spot.id, day)}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div className={styles.spotList}>
                    <div className={styles.spotListContainer}>
                        <div className={styles.searchHeader}>
                            <h1 className={styles.pageTitle}>旅行先検索</h1>
                            
                            {/* 検索フォーム */}
                            <form onSubmit={handleSearch} className={styles.searchForm}>
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="スポット名や都道府県名で検索"
                                    className={styles.searchInput}
                                />
                                <button type="submit" className={styles.searchButton}>検索</button>
                            </form>
                        </div>
                    
                        <div className={styles.resultInfo}>
                            {keyName ? (
                                <p>「{keyName}」の検索結果: {spotData?.pagination.total}件</p>
                            ) : (
                                <p>全{spotData?.pagination.total}件のスポット</p>
                            )}
                        </div>
                        {/* フィルター */}
                        <div className={styles.filterContainer}>
                            <div className={styles.filterLabel}>フィルター:</div>
                            <div className={styles.filterOptions}>
                                <button 
                                    className={`${styles.filterButton} ${activeFilter === "all" ? styles.activeFilter : ""}`} 
                                    onClick={() => handleFilterChange("all")}
                                >
                                    すべて
                                </button>
                                
                                {/* 動的にフィルターボタンを生成 */}
                                {destinations.map((destination, index) => (
                                    <button 
                                        key={`filter-${index}`}
                                        className={`${styles.filterButton} ${activeFilter === destination ? styles.activeFilter : ""}`} 
                                        onClick={() => handleFilterChange(destination)}
                                    >
                                        {destination}
                                    </button>
                                ))}
                            </div>
                        </div>

                        
                        {/* スポット一覧 */}
                        {isLoading ? (
                            <div className={styles.loadingContainer}>
                                <Loading />
                            </div>
                        ) : (
                            <div>
                                {spotData && spotData.spots.length > 0 ? (
                                    <div className={styles.spotsGrid}>
                                        {spotData?.spots.map((spot) => (
                                            <div key={spot.id} className={styles.spotCard}>
                                                {/* カード全体をクリックでポップアップを表示 */}
                                                <div 
                                                    className={styles.cardContent} 
                                                    onClick={() => openSpotPopup(spot)}
                                                >
                                                    <div className={styles.imageContainer}>
                                                        <Image 
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
                                                {/* 追加ボタン - イベント伝播を防止 */}
                                                <button 
                                                    className={styles.addButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // カード全体のクリックイベントを阻止
                                                        handleAddSpot(spot);
                                                    }}
                                                >
                                                    プランに追加
                                                </button>
                                            </div>
                                        ))}
                                        {/* スポット詳細ポップアップを使用 */}
                                        {selectedSpotForPopup && (
                                            <SpotDetailPopup 
                                                spot={selectedSpotForPopup} 
                                                onClose={closeSpotPopup}
                                                onAddToPlanner={(spot) => {
                                                    handleAddSpot(spot);
                                                    closeSpotPopup(); // 追加後に閉じる
                                                }}
                                            />
                                        )}
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
                </div>
            </div>
        </div>
    );
}