'use client'

import { useState } from "react"
import styles from "./makeTabi.module.css";
import { TextField } from '@mui/material';
import Image from "next/image";
import { uploadImageToSupabase } from '@/app/utils/uploadImage';

interface TouristSpot {
    name: string;
    description: string;
    imageUrl?: string; // 画像URLを保存するためのプロパティを追加
    isGeneratingImage?: boolean; // 画像生成中フラグ
}
  
interface PrefectureSpots {
    prefecture: string;
    spots: TouristSpot[];
}

export default function MakeTabi() {
    const [structuredData, setStructuredData] = useState<PrefectureSpots[]>([]);
    const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([]); 
    const [number, setNumber] = useState<number | string>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isStoreing, setIsStoreing] = useState(false);
    const [isGeneratingAllImages, setIsGeneratingAllImages] = useState(false);
    const [isStoreingAll, setIsStoreingAll] = useState(false);

    const makeTabi = async() => {
        try {
            if (selectedPrefectures.length === 0) {
                setErrorMessage("都道府県を少なくとも1つ選択してください");
                return;
            }
    
            let numberValue = number === "" ? 1 : Number(number);
            if (numberValue < 1) numberValue = 1;
            if (numberValue > 50) numberValue = 50;
    
            setIsLoading(true);
            setErrorMessage("");
            setStructuredData([]);
            
            const response = await fetch('http://127.0.0.1:5000/makeTabi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prefectures: selectedPrefectures,
                    number: numberValue,
                }),
            });
            
            // レスポンスをテキストとして取得し、安全に解析する
            const responseText = await response.text();
            console.log("APIからの生のレスポンス:", responseText);
            
            // レスポンスの解析
            try {
                // サーバーからのデータをJSON形式に変換
                const responseData = JSON.parse(responseText);
                console.log("パース後のレスポンスデータ:", responseData);
                
                if (!response.ok) {
                    // エラーレスポンスの処理
                    setErrorMessage(`エラー: ${responseData.detail || '不明なエラーが発生しました'}`);
                    return;
                }
                
                // structured_dataフィールドをチェック
                if (responseData.structured_data && Array.isArray(responseData.structured_data)) {
                    // 画像URL用のプロパティを追加
                    const dataWithImageProps = responseData.structured_data.map((prefecture: PrefectureSpots) => ({
                        ...prefecture,
                        spots: prefecture.spots.map(spot => ({
                            ...spot,
                            imageUrl: undefined,
                            isGeneratingImage: false
                        }))
                    }));
                    
                    setStructuredData(dataWithImageProps);
                    console.log("構造化データを受信:", dataWithImageProps);
                } else {
                    // structured_dataがない場合の対応
                    console.warn("構造化データが見つからないか、形式が不正です");
                    setErrorMessage("データの形式が不正です: structured_dataフィールドがありません");
                }
                
            } catch (parseError) {
                console.error("JSONの解析に失敗:", parseError);
                setErrorMessage("受信したデータの形式が不正です");
            }
        } catch (error) {
            console.error('API呼び出しエラー:', error);
            setErrorMessage("API呼び出し中にエラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    };

    // 特定のスポットについて画像を生成する関数
    const generateImageForSpot = async (prefectureIndex: number, spotIndex: number) => {
        const spot = structuredData[prefectureIndex].spots[spotIndex];
        const prompt = `${structuredData[prefectureIndex].prefecture}の観光名所、${spot.name}。${spot.description}`;
        
        // 画像生成中のフラグを設定
        const updatedData = [...structuredData];
        updatedData[prefectureIndex].spots[spotIndex].isGeneratingImage = true;
        setStructuredData(updatedData);
        
        try {
            console.log(`画像生成開始: ${prompt}`);
            
            const response = await fetch('http://127.0.0.1:5000/make_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                }),
            });
            
            if (!response.ok) {
                let errorMessage = '画像生成に失敗しました';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (error) {
                    // JSONでない場合はそのまま
                    console.debug('レスポンスがJSONでない形式:', error);
                }
                throw new Error(errorMessage);
            }
            
            // レスポンスをBlobとして取得
            const imageBlob = await response.blob();
            
            // BlobからURLを作成
            const imageUrl = URL.createObjectURL(imageBlob);
            
            // 画像URLを状態に反映
            const newData = [...structuredData];
            newData[prefectureIndex].spots[spotIndex].imageUrl = imageUrl;
            newData[prefectureIndex].spots[spotIndex].isGeneratingImage = false;
            setStructuredData(newData);
            
            console.log(`画像生成完了: ${imageUrl}`);
            
        } catch (error) {
            console.error('画像生成エラー:', error);
            
            // エラー状態を反映
            const newData = [...structuredData];
            newData[prefectureIndex].spots[spotIndex].isGeneratingImage = false;
            setStructuredData(newData);
            
            // 全体のエラーメッセージは設定しない（個別のスポットでの失敗なので）
            alert(`画像生成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
        } finally {
            console.log(`生成後のデータ:`, structuredData);
        }
    };

    // コンポーネントのアンマウント時にBlobURLを解放するクリーンアップ関数
    const cleanupImageUrls = () => {
        if (structuredData) {
            structuredData.forEach(prefecture => {
                prefecture.spots.forEach(spot => {
                    if (spot.imageUrl) {
                        URL.revokeObjectURL(spot.imageUrl);
                    }
                });
            });
        }
    };

    // すべてのスポットの画像を生成する関数
    const generateAllImages = async () => {
        if (!structuredData.length) return;
        setIsGeneratingAllImages(true);
        
        // すべてのスポットを処理
        for (let prefIndex = 0; prefIndex < structuredData.length; prefIndex++) {
            for (let spotIndex = 0; spotIndex < structuredData[prefIndex].spots.length; spotIndex++) {
                // すでに画像があるスポットはスキップ
                if (!structuredData[prefIndex].spots[spotIndex].imageUrl) {
                    await generateImageForSpot(prefIndex, spotIndex);
                    
                    // 連続リクエストを避けるために少し待機
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        setIsGeneratingAllImages(false);
    };

    // 既存のハンドラ関数
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        if (value === "") {
            setNumber(value);
        } else if (!isNaN(Number(value))) {
            let numValue = Number(value);
            
            // 範囲内に値を制限
            if (numValue < 1) numValue = 1;
            if (numValue > 50) numValue = 50;
            
            setNumber(numValue);
        }
    };

    const handleBlur = () => {
        // フォーカスを外したとき、値が空または範囲外なら修正
        if (number === "" || Number(number) < 1) {
            setNumber(1);
        } else if (Number(number) > 50) {
            setNumber(50);
        }
    };

    const fetchFlask = () => {
        // BlobURLをクリーンアップ
        cleanupImageUrls();
        
        makeTabi();
        console.log(selectedPrefectures);
        console.log(number);
        // handleReset();
        // setNumber(1);
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSelectedPrefectures(prevState => 
            event.target.checked 
            ? [...prevState, value]  // チェックされた場合は追加
            : prevState.filter(pref => pref !== value)  // チェック外された場合は削除
        );
    };

    const prefectures = [
        "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
        "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
        "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
        "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
        "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
        "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
        "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
    ];

    // 全選択ボタンの処理
    const handleSelectAll = () => {
        setSelectedPrefectures(prefectures);  // すべての都道府県を選択
    };

    // リセットボタンの処理
    const handleReset = () => {
        setSelectedPrefectures([]);  // すべての選択を解除
        setNumber(1);
    };

    // BlobURLから画像データを取得する関数
    const getBlobFromUrl = async (url: string): Promise<Blob> => {
        const response = await fetch(url);
        return await response.blob();
    };
    
    // Blobをbase64に変換する関数
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
        });
    };

    const handleStore = async (prefIndex: number, spotIndex: number) => {
        try {
            setIsStoreing(true);
            
            const prefecture = structuredData[prefIndex].prefecture;
            const spot = structuredData[prefIndex].spots[spotIndex];

            if (!spot.imageUrl) {
                alert('画像がありません。先に画像を生成してください。');
                setIsStoreing(false);
                return;
            }

            console.log(`都道府県: ${prefecture}`);
            console.log(`スポット名: ${spot.name}`);
            console.log(`スポット説明: ${spot.description}`);
            console.log(`スポット画像URL: ${spot.imageUrl}`);

            // 1. BlobURLから実際のBlobを取得
            const blob = await getBlobFromUrl(spot.imageUrl);

            // 2. BlobをBase64に変換
            const base64Image = await blobToBase64(blob);

            console.log('Base64に変換しました');

            // 3. Supabaseストレージに画像をアップロード
            const imageUrl = await uploadImageToSupabase(base64Image, 'spot-images');

            if (!imageUrl) {
                throw new Error('画像のアップロードに失敗しました');
            }
        
            console.log(`Supabaseに画像をアップロードしました: ${imageUrl}`);

            // 4. APIを呼び出してデータベースに保存
            const response = await fetch('/api/createSpot', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                prefectureName: prefecture,
                spotName: spot.name,
                description: spot.description,
                imageUrl: imageUrl
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '保存中にエラーが発生しました');
            }
            
            const data = await response.json();
            console.log('保存完了:', data);
            
            // 成功メッセージを表示
            console.log('保存完了:', data.message);
      
        } catch (error) {
            console.error('保存エラー:', error);
            console.error('保存エラー:', error);
        } finally {
            setIsStoreing(false);
        }
    }

    // すべてのスポットを一括で保存
    const handleStoreAll = async () => {
        if (!structuredData || structuredData.length === 0) {
            alert('保存する観光スポット情報がありません。');
            return;
        }
        
        setIsStoreingAll(true);

        let successCount = 0;
        let errorCount = 0;

        try {
            for (let prefIndex = 0; prefIndex < structuredData.length; prefIndex++) {
                const prefecture = structuredData[prefIndex];
                
                // 各スポットを処理
                for (let spotIndex = 0; spotIndex < prefecture.spots.length; spotIndex++) {
                const spot = prefecture.spots[spotIndex];
                
                // 画像がない場合はスキップ
                if (!spot.imageUrl) {
                    console.log(`スキップ: ${prefecture.prefecture}の${spot.name} (画像なし)`);
                    errorCount++;
                    continue;
                }
                
                try {
                    // Blobを取得
                    const blob = await getBlobFromUrl(spot.imageUrl);
                    
                    // Base64に変換
                    const base64Image = await blobToBase64(blob);
                    
                    // Supabaseに画像をアップロード
                    const imageUrl = await uploadImageToSupabase(base64Image, 'spot-images');
                    
                    if (!imageUrl) {
                    throw new Error('画像のアップロードに失敗しました');
                    }
                    
                    // データベースに保存
                    const response = await fetch('/api/createSpot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prefectureName: prefecture.prefecture,
                        spotName: spot.name,
                        description: spot.description,
                        imageUrl: imageUrl
                    }),
                    });
                    
                    if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '保存中にエラーが発生しました');
                    }
                    
                    const data = await response.json();

                    console.log(`保存完了: ${data}`);
                    successCount++;
                    
                    // サーバーへの負荷を減らすために少し待機
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (error) {
                    console.error(`保存エラー (${prefecture.prefecture}の${spot.name}):`, error);
                    errorCount++;
                }
                }
            }
            
            // 保存結果の通知
            if (successCount > 0) {
                alert(`保存完了: ${successCount}件のスポットを保存しました。${errorCount > 0 ? `\n保存に失敗したスポット: ${errorCount}件` : ''}`);
            } else if (errorCount > 0) {
                alert(`エラー: すべてのスポットの保存に失敗しました。(${errorCount}件)`);
            }
        } catch (error) {
          console.error('一括保存処理でエラーが発生:', error);
          alert(`一括保存処理中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
        } finally {
            setIsStoreingAll(false);
        }
    }
        

    return (
        <div className={styles.main}>
            <div className={styles.waku}>
                <div className={styles.setting}>
                    <h2 className={styles.h2}>作成する観光地の都道府県を選択してください</h2>
                    <div className={styles.checkboxContainer}>
                        {prefectures.map((prefecture) => (
                            <div key={prefecture} className={styles.checkboxItem}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value={prefecture}
                                        onChange={handleCheckboxChange}
                                        checked={selectedPrefectures.includes(prefecture)}  // 選択されているかどうか
                                    />
                                    {prefecture}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className={styles.buttonContainer}>
                        <button onClick={handleSelectAll} className={styles.button}>全て選択</button>
                        <button onClick={handleReset} className={styles.button}>リセット</button>
                    </div>
                    <div>
                        <h3 className={styles.h3}>選択された都道府県:</h3>
                        {selectedPrefectures && selectedPrefectures.length > 0 ? (
                            <ul className={styles.selectedItems}>
                                {selectedPrefectures.map(pref => (
                                    <li key={pref} className={styles.li}>{pref}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>選択させていません</p>
                        )}
                    </div>
                    <div>
                        <TextField
                            label="各都道府県の作成数"
                            type="number"
                            value={number}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            variant="outlined"
                            sx={{
                                marginTop: "10px",
                            }}
                        />
                    </div>
                </div>
                <div className={styles.buttons}>
                    <button 
                        onClick={fetchFlask} 
                        className={styles.button}
                        disabled={isLoading || selectedPrefectures.length === 0}
                    > 
                        {isLoading ? '生成中...' : '作成'}
                    </button>
                    <div className={styles.responseContainer}>
                        {isLoading ? (
                            <p className={styles.loading}>観光スポット情報を取得中です...</p>
                        ) : errorMessage ? (
                            <p className={styles.error}>{errorMessage}</p>
                        ) : structuredData.length > 0 ? (
                            // 構造化データの表示（画像生成機能付き）
                            structuredData.map((prefData, prefIndex) => ( //prifData: 都道府県, prefIndex: structuredDataのインデックス
                                <div key={prefIndex} className={styles.prefectureBlock}>
                                    <p className={styles.prefectureTitle}># {prefData.prefecture}</p>
                                    {prefData.spots.map((spot, spotIndex) => (
                                        <div key={spotIndex} className={styles.spotContainer}>
                                            <div className={styles.spotHeader}>
                                                <p className={styles.spotItem}>
                                                    {spotIndex + 1}. {spot.name}: {spot.description}
                                                </p>
                                                {/* 画像表示領域 */}
                                                {spot.imageUrl && !spot.isGeneratingImage && (
                                                    <Image 
                                                        src={spot.imageUrl} 
                                                        alt={`${spot.name}のイメージ`} 
                                                        width={512} // 適切なサイズを設定してください
                                                        height={1024} 
                                                        className={styles.spotImage}
                                                    />
                                                )}
                                                <div className={styles.functionButtons}>
                                                    <button
                                                        className={styles.functionButton}
                                                        onClick={() => generateImageForSpot(prefIndex, spotIndex)}
                                                        disabled={spot.isGeneratingImage}
                                                    >
                                                        {spot.isGeneratingImage ? '生成中...' : `${!spot.imageUrl ? '画像生成' : '画像再生成'}`}
                                                    </button>
                                                    <button
                                                        className={styles.functionButton}
                                                        onClick={() => handleStore(prefIndex, spotIndex)}
                                                        disabled={spot.imageUrl === undefined}
                                                    >保存</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <p className={styles.noData}>観光スポット情報がありません。上の「作成」ボタンをクリックして情報を生成してください。</p>
                        )}
                    </div>
                    {structuredData && structuredData.length > 0 && (
                        <div>
                            <button
                                className={styles.generateAllImagesButton}
                                onClick={generateAllImages}
                            >
                                {isGeneratingAllImages ? "生成中..." : "全スポットの画像を生成"}
                            </button>
                            <button
                                className={styles.generateAllImagesButton}
                                onClick={handleStoreAll}
                                disabled={isStoreing}
                            >
                                {isStoreingAll ? "保存中..." : "全スポットの情報を保存"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}