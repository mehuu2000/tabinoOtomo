import React from 'react';
import { InputAdornment, TextField, FormControlLabel, Checkbox, Autocomplete, IconButton } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import styles from './module_css/mySearch_c.module.css';
import { useAtom, useAtomValue } from 'jotai';
import {
    travelDataAtom,
    goToAtom,
    whenAtom,
    daysAtom,
    weatherAtom,
    isFormValidAtom
} from '../store/travelAtoms';
import { useRouter } from 'next/navigation';


// 日本の都道府県リスト
const prefectures = [
  '指定なし', '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', 
  '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都',
  '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府',
  '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県',
  '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県',
  '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// interface MySearchProps {
//     goTo: string;
//     setGoTo: React.Dispatch<React.SetStateAction<string>>;

//     when: string;
//     setWhen: React.Dispatch<React.SetStateAction<string>>;

//     days: number;
//     setDays: React.Dispatch<React.SetStateAction<number>>;

//     weather: boolean;
//     setWeather: React.Dispatch<React.SetStateAction<boolean>>;

//     displayMySearch: () => void; 
// }

// export default function MySearch_c({ goTo, setGoTo, when, setWhen, days, setDays, weather, setWeather, displayMySearch }: MySearchProps) {
export default function MySearch_c() {
    // Jotaiのatomを使用して状態管理を一元化
    // const [goTo, setGoTo] = useAtom(goToAtom);
    const [destinations, setDestinations] = useAtom(goToAtom);
    const [when, setWhen] = useAtom(whenAtom);
    const [days, setDays] = useAtom(daysAtom);
    const [weather] = useAtom(weatherAtom);

    // フォームバリデーション
    const formIsValid = useAtomValue(isFormValidAtom);

    // 最終的な旅行データを保存するためのatom
    const [, setTravelData] = useAtom(travelDataAtom);
    // const setTravelData = useAtom(travelDataAtom);

    const router = useRouter();

    // 行き先フィールドを追加する関数
    const addDestination = () => {
        if (destinations.length < 3) {
            setDestinations([...destinations, '']);
        }
    };

    // 行き先フィールドを削除する関数
    const removeDestination = (index: number) => {
        const newDestinations = [...destinations];
        newDestinations.splice(index, 1);
        setDestinations(newDestinations);
    };

    // 特定のインデックスの行き先を更新する関数
    const updateDestination = (index: number, value: string) => {
        const newDestinations = [...destinations];
        newDestinations[index] = value;
        setDestinations(newDestinations);
    };

    const handleWhenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWhen(event.target.value);
    }

    const handleDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // 数値のみ許可する処理を追加
        const value = event.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setDays(value === '' ? 0 : parseInt(value, 10));
        }
    }

    // const handleWeatherChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setWeather(event.target.checked);
    // };

    const handleNextPage = () => {
        // 現在の値を統合して保存
        setTravelData({
            goTo: destinations.filter(dest => dest !== ''),
            when,
            days,
            weather
        });
        
        console.log("旅行データを保存しました:", { destinations, when, days, weather });
        
        // 次のページへ遷移
        router.push('/TabinoOtomo/home/createSelect/mySearch/planGeneration');
    };

    // 初期表示時に設定
    React.useEffect(() => {
        if (destinations.length === 0) {
            setDestinations(['']);
        }
    }, [destinations.length, setDestinations]);

    return(
        <div className={styles.main}>
            <div className={styles.information}>
                <h2 className={styles.h2}>必要な情報を記入してください</h2>
                <div className={styles.contents}>
                    {/* 行き先入力フィールド - 既存のUIに合わせてスタイリング */}
                    <div className={styles.destinationsContainer}>
                        <div className={styles.destinationLabel}>行き先 （最大3箇所まで）</div>
                        
                        {destinations.map((destination, index) => (
                            <div key={`destination-${index}`} className={styles.destinationField}>
                                <Autocomplete
                                    options={prefectures}
                                    value={destination}
                                    onChange={(_, newValue) => {
                                        updateDestination(index, newValue || '');
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="standard"
                                            placeholder={`行き先 ${index + 1}`}
                                            sx={{
                                                width: '200px',
                                                '& .MuiInputBase-input': {
                                                    textAlign: 'center',
                                                },
                                            }}
                                        />
                                    )}
                                    freeSolo
                                    autoSelect
                                />
                                
                                {index > 0 && (
                                    <IconButton
                                        onClick={() => removeDestination(index)}
                                        size="small"
                                        className={styles.removeButton}
                                        sx={{ color: '#ff6b6b' }}
                                    >
                                        <RemoveCircleIcon />
                                    </IconButton>
                                )}
                            </div>
                        ))}
                        
                        {destinations.length < 3 && (
                            <div 
                                className={styles.addButtonContainer}
                                onClick={addDestination}
                            >
                                <AddCircleIcon sx={{ color: 'rgb(179, 128, 226)' }} />
                                <span>行き先を追加</span>
                            </div>
                        )}
                    </div>
                    <div className={styles.content}>
                        <label htmlFor="when">いつから</label>
                        <TextField 
                            id="when" 
                            type='date'
                            label="" 
                            variant="standard" 
                            value={when}
                            onChange={handleWhenChange}
                            slotProps={{
                                htmlInput: {
                                    autoComplete: 'off',
                                },
                            }}
                            sx={{
                                width: '200px',
                                '& .MuiInputBase-input': {
                                    textAlign: 'center',
                                },
                            }}
                        />
                    </div>
                    <div className={styles.content}>
                        <label htmlFor="days">何日間</label>
                        <TextField 
                            id="days" 
                            label=""
                            variant="standard"
                            value={days || ''}
                            onChange={handleDaysChange}
                            inputProps={{
                                min: 1,
                                inputMode: 'numeric',
                                pattern: '[0-9]*'
                            }}
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">日間</InputAdornment>,
                                },
                                htmlInput: {
                                    autoComplete: 'off',
                                },
                            }}
                            sx={{
                                width: '200px',
                                '& .MuiInputBase-input': {
                                    textAlign: 'center',
                                },
                            }}
                        />
                    </div>

                    {/* <FormControlLabel 
                        control={
                            <Checkbox 
                                checked={weather} 
                                onChange={handleWeatherChange} 
                            />
                        } 
                        label="行き先の天気予報を調べる" 
                    /> */}

                    <button 
                        className={styles.button}
                        onClick={handleNextPage}
                        disabled={!formIsValid}
                    >
                        これで検索する
                    </button>
                </div>
            </div>
        </div>
    )
}



// import { InputAdornment, TextField, FormControlLabel, Checkbox } from '@mui/material';
// import styles from './module_css/mySearch_c.module.css';

// interface MySearchProps {
//     goTo: string;
//     setGoTo: React.Dispatch<React.SetStateAction<string>>;

//     when: string;
//     setWhen: React.Dispatch<React.SetStateAction<string>>;

//     days: number;
//     setDays: React.Dispatch<React.SetStateAction<number>>;

//     weather: boolean;
//     setWeather: React.Dispatch<React.SetStateAction<boolean>>;

//     displayMySearch: () => void; 
// }

// export default function MySearch_c({ goTo, setGoTo, when, setWhen, days, setDays, weather, setWeather, displayMySearch }: MySearchProps) {

//     const handleGoToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         setGoTo(event.target.value); 
//     };

//     const handleWhenChange = (event : React.ChangeEvent<HTMLInputElement>) => {
//         setWhen(event.target.value);
//     }

//     const handleDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         setDays(event.target.value);
//     }

//     const handleWeatherChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         setWeather(event.target.checked);
//     };

//     return(
//         <div className={styles.main}>
//             <div className={styles.information}>
//                 <h2 className={styles.h2}>必要な情報を記入してください</h2>
//                 <div className={styles.contents}>
//                     <div className={styles.content}>
//                         <label htmlFor="go-to">行き先</label>
//                         <TextField 
//                             id="go-to" 
//                             label="" 
//                             variant="standard" 
//                             onChange={handleGoToChange}
//                             slotProps={{
//                                 htmlInput: {
//                                     autoComplete: 'off', // オートコンプリートを無効化
//                                 },
//                             }}
//                             sx={{
//                                 width: '200px',
//                                 '& .MuiInputBase-input': {
//                                     textAlign: 'center',
//                                 },
//                             }}
//                         />
//                     </div>
//                     <div className={styles.content}>
//                         <label htmlFor="when">いつから</label>
//                         <TextField 
//                             id="when" 
//                             type='date'
//                             label="" 
//                             variant="standard" 
//                             onChange={handleWhenChange}
//                             slotProps={{
//                                 // input: {
//                                 //     endAdornment: <InputAdornment position="end">年/月/日</InputAdornment>,
//                                 // },
//                                 htmlInput: {
//                                     autoComplete: 'off', // オートコンプリートを無効化
//                                 },
//                             }}
//                             sx={{
//                                 width: '200px',
//                                 '& .MuiInputBase-input': {
//                                     textAlign: 'center',
//                                 },
//                             }}
//                         />
//                     </div>
//                     <div className={styles.content}>
//                         <label htmlFor="days">何日間</label>
//                         <TextField 
//                             id="days" 
//                             label=""
//                             variant="standard" 
//                             onChange={handleDaysChange}
//                             slotProps={{
//                                 input: {
//                                     endAdornment: <InputAdornment position="end">日間</InputAdornment>,
//                                 },
//                                 htmlInput: {
//                                     autoComplete: 'off', // オートコンプリートを無効化
//                                 },
//                             }}
//                             sx={{
//                                 width: '200px',
//                                 '& .MuiInputBase-input': {
//                                     textAlign: 'center',
//                                 },
//                             }}
//                         />
//                     </div>

//                     <FormControlLabel 
//                         control={<Checkbox onChange={handleWeatherChange} />} 
//                         label="行き先の天気予報を調べる" 
//                     />

//                     <button 
//                         className={styles.button} 
//                         onClick={displayMySearch}
//                     >これで検索する</button>
                    
//                 </div>
//             </div>
//         </div>
//     )
// }