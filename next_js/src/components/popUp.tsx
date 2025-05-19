import React from 'react';
import Image from 'next/image';
import styles from './module_css/spotDetailPopup.module.css';

// スポットの型定義
interface Spot {
    id: number;
    name: string;
    prectures: string;
    description: string;
    imageUrl: string;
    updatedAt: string;
}

// ポップアップのプロップス
interface SpotDetailPopupProps {
    spot: Spot;
    onClose: () => void;
    onAddToPlanner?: (spot: Spot) => void; // 追加ボタンの処理（オプション）
    showAddButton?: boolean; // 追加ボタン表示の有無（オプション）
}

/**
 * スポット詳細ポップアップコンポーネント
 */
const SpotDetailPopup: React.FC<SpotDetailPopupProps> = ({ 
    spot, 
    onClose, 
    onAddToPlanner,
    showAddButton = true // デフォルトで表示
}) => {
    // 追加ボタンのクリックハンドラ
    const handleAddButtonClick = () => {
        if (onAddToPlanner) {
            onAddToPlanner(spot);
        }
    };

    // 日付のフォーマット処理
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <div 
                className={styles.popupContent}
                onClick={(e) => e.stopPropagation()} // 内側クリックは閉じないように
            >
                <button className={styles.popupCloseButton} onClick={onClose}>
                    ×
                </button>
                
                {/* 画像コンテナに余白クラスを追加 */}
                <div className={styles.popupImageWrapper}>
                    <div className={styles.popupImageContainer}>
                        <Image 
                            src={spot.imageUrl} 
                            alt={spot.name}
                            width={600}
                            height={400}
                            className={styles.popupImage}
                        />
                    </div>
                </div>
                
                <div className={styles.popupInfo}>
                    <h2>{spot.name}</h2>
                    <p className={styles.popupPrefecture}>{spot.prectures}</p>
                    <p className={styles.popupDescription}>{spot.description}</p>
                    <p className={styles.updateDate}>
                        最終更新: {formatDate(spot.updatedAt)}
                    </p>
                    {showAddButton && onAddToPlanner && (
                        <button 
                            className={styles.popupAddButton}
                            onClick={handleAddButtonClick}
                        >
                            プランに追加
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpotDetailPopup;