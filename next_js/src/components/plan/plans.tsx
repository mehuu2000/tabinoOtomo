import styles from '../module_css/plan.module.css';
import Loading from "@/components/Loading";
import { Plan, PlanItem } from "@/components/plan_c";
import Image from 'next/image';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect, useRef } from 'react';

interface PlansProps {
    plans: Plan[];
    setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
    isLoading: boolean;
}

export default function Plans({plans, setPlans, isLoading}: PlansProps) {
    // カード毎のスライダーインデックス状態を管理
    const [sliderIndices, setSliderIndices] = useState<Record<number, number>>({});
    // ホバー中のカードIDを管理
    const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
    // スライダーのタイマー参照を保存
    const sliderIntervalRef = useRef<NodeJS.Timeout | null>(null);
    // アニメーション状態を管理
    const [animating, setAnimating] = useState<Record<number, boolean>>({});
    // モーダル表示状態
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 選択されたプラン
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    
    // モーダル外クリック用ref
    const modalRef = useRef<HTMLDivElement>(null);

    // fromWhenは秒単位のタイムスタンプなので日付に変換
    const formatTimestamp = (timestamp: number): string => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };
    
    // 通常の日付フォーマット
    const formatDate = (dateStr: string | Date): string => {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // 詳細表示ボタンのクリックハンドラー
    const handleViewDetails = (plan: Plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
        // スクロール防止
        document.body.style.overflow = 'hidden';
    };

    // モーダル閉じるハンドラー
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPlan(null);
        // スクロール復活
        document.body.style.overflow = '';
    };

    // モーダル外クリックで閉じる
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeModal();
            }
        };

        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    // 日ごとにスポットをグループ化する関数
    const groupSpotsByDay = (spots: PlanItem[]) => {
        const groupedSpots: Record<number, PlanItem[]> = {};
        
        spots.forEach(spot => {
            if (!groupedSpots[spot.day]) {
                groupedSpots[spot.day] = [];
            }
            groupedSpots[spot.day].push(spot);
        });
        
        // 各日のスポットを順番で並べ替え
        Object.keys(groupedSpots).forEach(day => {
            const dayNum = parseInt(day);
            groupedSpots[dayNum] = groupedSpots[dayNum].sort((a, b) => a.order - b.order);
        });
        
        return groupedSpots;
    };

    // スライド切り替えの処理
    const changeSlide = (planId: number, spotsLength: number) => {
        // アニメーション中なら処理をスキップ
        if (animating[planId]) return;
        
        // アニメーション状態を開始
        setAnimating(prev => ({ ...prev, [planId]: true }));
        
        setTimeout(() => {
            setSliderIndices(prev => {
                const currentIndex = prev[planId] || 0;
                return {
                    ...prev,
                    [planId]: (currentIndex + 1) % spotsLength
                };
            });
            
            // アニメーション終了フラグ（遅延）
            setTimeout(() => {
                setAnimating(prev => ({ ...prev, [planId]: false }));
            }, 50);
        }, 600); // スライドアウト後に次の画像をセット
    };

    // ホバー開始時の処理
    const handleMouseEnter = (planId: number, spotsLength: number) => {
        if (spotsLength <= 1) return; // スポットが1つ以下なら何もしない
        
        setHoveredCardId(planId);
        
        // スライドショーを開始
        if (sliderIntervalRef.current) {
            clearInterval(sliderIntervalRef.current);
        }
        
        sliderIntervalRef.current = setInterval(() => {
            changeSlide(planId, spotsLength);
        }, 3000); // 3秒ごとに切り替え（アニメーション用に長めに）
    };

    // ホバー終了時の処理
    const handleMouseLeave = (planId: number) => {
        setHoveredCardId(null);
        
        // タイマーをクリア
        if (sliderIntervalRef.current) {
            clearInterval(sliderIntervalRef.current);
            sliderIntervalRef.current = null;
        }
        
        // アニメーション中でなければインデックスを最初に戻す
        if (!animating[planId]) {
            setSliderIndices(prev => ({
                ...prev,
                [planId]: 0
            }));
        }
    };

    // コンポーネントのアンマウント時にタイマーをクリア
    useEffect(() => {
        return () => {
            if (sliderIntervalRef.current) {
                clearInterval(sliderIntervalRef.current);
            }
        };
    }, []);
    // コンポーネントのアンマウント時にタイマーをクリア
    // useEffect(() => {
    //     return () => {
    //         if (sliderIntervalRef.current) {
    //             clearInterval(sliderIntervalRef.current);
    //         }
    //         document.body.style.overflow = ''; // スクロール復活を保証
    //     };
    // }, []);
    
    return (
        <div className={styles.main}>
            {isLoading ? (
                <div className={styles.loadingContainer}>
                    <Loading />
                </div>
            ) : (
                <div className={styles.plansContainer}>
                    {plans.length > 0 ? (
                        plans.map((plan) => {
                            const hasSpots = plan.spots && plan.spots.length > 0;
                            const currentSpotIndex = sliderIndices[plan.id] || 0;
                            const currentSpot = hasSpots ? plan.spots[currentSpotIndex].spot : null;
                            const isAnimating = animating[plan.id] || false;
                            
                            return (
                                <div 
                                    key={plan.id} 
                                    className={styles.planCard}
                                    onMouseEnter={() => handleMouseEnter(plan.id, plan.spots?.length || 0)}
                                    onMouseLeave={() => handleMouseLeave(plan.id)}
                                >
                                    {/* スポット画像をヘッダーとして表示 */}
                                    <div className={styles.imageHeader}>
                                        {currentSpot ? (
                                            <div className={styles.imageSlider}>
                                                <Image
                                                    src={currentSpot.imageUrl}
                                                    alt={currentSpot.name}
                                                    width={300}
                                                    height={200}
                                                    className={`${styles.spotImage} ${isAnimating ? styles.animating : ''}`}
                                                    priority={currentSpotIndex === 0}
                                                />
                                                
                                                {/* スポット数が複数ある場合はインジケーターを表示 */}
                                                {plan.spots.length > 1 && (
                                                    <div className={styles.sliderIndicator}>
                                                        {plan.spots.map((_, idx) => (
                                                            <span 
                                                                key={idx} 
                                                                className={`${styles.indicatorDot} ${idx === currentSpotIndex ? styles.activeDot : ''}`}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={styles.noImage}>
                                                画像がありません
                                            </div>
                                        )}
                                        
                                        {/* ステータスアイコン */}
                                        <div className={styles.statusIcons}>
                                            {plan.favorite && (
                                                <div className={styles.favoriteIcon} title="お気に入り">
                                                    <StarIcon />
                                                </div>
                                            )}
                                            {plan.visited && (
                                                <div className={styles.visitedIcon} title="訪問済み">
                                                    <CheckCircleIcon />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* プラン詳細（変更なし） */}
                                    <div className={styles.planContent}>
                                        <h3 className={styles.planTitle}>{plan.title}</h3>
                                        
                                        <div className={styles.planInfo}>
                                            <div className={styles.infoRow}>
                                                <CalendarTodayIcon className={styles.infoIcon} />
                                                <span>開始日: {formatTimestamp(plan.fromWhen)}</span>
                                            </div>
                                            
                                            <div className={styles.infoRow}>
                                                <DateRangeIcon className={styles.infoIcon} />
                                                <span>{plan.days}日間の旅程</span>
                                            </div>
                                            
                                            <div className={styles.infoRow}>
                                                <UpdateIcon className={styles.infoIcon} />
                                                <span>最終更新: {formatDate(plan.createAt)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.planActions}>
                                            <button 
                                                className={styles.detailButton}
                                                onClick={() => handleViewDetails(plan)}
                                            >
                                                詳細を見る
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className={styles.emptyState}>
                            <p>プランがありません。新しい旅行プランを作成しましょう！</p>
                        </div>
                    )}
                </div>
            )}

            {/* プラン詳細モーダル */}
            {isModalOpen && selectedPlan && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} ref={modalRef}>
                        <div className={styles.modalHeader}>
                            <h2>{selectedPlan.title}</h2>
                            <button className={styles.closeButton} onClick={closeModal}>
                                <CloseIcon />
                            </button>
                        </div>
                        
                        <div className={styles.modalInfo}>
                            <div className={styles.infoRow}>
                                <CalendarTodayIcon className={styles.infoIcon} />
                                <span>開始日: {formatTimestamp(selectedPlan.fromWhen)}</span>
                            </div>
                            
                            <div className={styles.infoRow}>
                                <DateRangeIcon className={styles.infoIcon} />
                                <span>{selectedPlan.days}日間の旅程</span>
                            </div>
                            
                            <div className={styles.infoRow}>
                                <UpdateIcon className={styles.infoIcon} />
                                <span>作成日: {formatDate(selectedPlan.createAt)}</span>
                            </div>
                        </div>
                        
                        <div className={styles.modalBody}>
                            {selectedPlan.spots && selectedPlan.spots.length > 0 ? (
                                <div className={styles.daysContainer}>
                                    {Object.entries(groupSpotsByDay(selectedPlan.spots)).map(([day, daySpots]) => (
                                        <div key={day} className={styles.daySection}>
                                            <h3 className={styles.dayTitle}>{day}日目</h3>
                                            <div className={styles.daySpots}>
                                                {daySpots.map((planItem, index) => (
                                                    <div key={planItem.id} className={styles.spotCard}>
                                                        <div className={styles.spotOrder}>{index + 1}</div>
                                                        <div className={styles.spotImageContainer}>
                                                            <Image
                                                                src={planItem.spot.imageUrl}
                                                                alt={planItem.spot.name}
                                                                width={150}
                                                                height={100}
                                                                className={styles.spotThumbnail}
                                                            />
                                                        </div>
                                                        <div className={styles.spotInfo}>
                                                            <h4 className={styles.spotName}>{planItem.spot.name}</h4>
                                                            <p className={styles.spotPrefecture}>{planItem.spot.prectures}</p>
                                                            {/* 説明文を追加 */}
                                                            <p className={styles.spotDescription}>
                                                                {planItem.spot.description.length > 150 
                                                                    ? `${planItem.spot.description.substring(0, 150)}...` 
                                                                    : planItem.spot.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.noSpots}>このプランにはスポットが登録されていません。</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}