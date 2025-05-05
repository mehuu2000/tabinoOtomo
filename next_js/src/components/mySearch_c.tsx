import { InputAdornment, TextField, FormControlLabel, Checkbox } from '@mui/material';
import styles from './module_css/mySearch_c.module.css';

interface MySearchProps {
    goTo: string;
    setGoTo: React.Dispatch<React.SetStateAction<string>>;

    when: string;
    setWhen: React.Dispatch<React.SetStateAction<string>>;

    days: string;
    setDays: React.Dispatch<React.SetStateAction<string>>;

    weather: boolean;
    setWeather: React.Dispatch<React.SetStateAction<boolean>>;

    displayMySearch: () => void; 
}

export default function MySearch_c({ goTo, setGoTo, when, setWhen, days, setDays, weather, setWeather, displayMySearch }: MySearchProps) {

    const handleGoToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGoTo(event.target.value); 
    };

    const handleWhenChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        setWhen(event.target.value);
    }

    const handleDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDays(event.target.value);
    }

    const handleWeatherChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWeather(event.target.checked);
    };

    return(
        <div className={styles.main}>
            <div className={styles.information}>
                <h2 className={styles.h2}>必要な情報を記入してください</h2>
                <div className={styles.contents}>
                    <div className={styles.content}>
                        <label htmlFor="go-to">行き先</label>
                        <TextField 
                            id="go-to" 
                            label="" 
                            variant="standard" 
                            onChange={handleGoToChange}
                            slotProps={{
                                // input: {
                                //     endAdornment: <InputAdornment position="end">都/道/府/県<br/>市/町/村</InputAdornment>,
                                // },
                                htmlInput: {
                                    autoComplete: 'off', // オートコンプリートを無効化
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
                        <label htmlFor="when">いつから</label>
                        <TextField 
                            id="when" 
                            type='date'
                            label="" 
                            variant="standard" 
                            onChange={handleWhenChange}
                            slotProps={{
                                // input: {
                                //     endAdornment: <InputAdornment position="end">年/月/日</InputAdornment>,
                                // },
                                htmlInput: {
                                    autoComplete: 'off', // オートコンプリートを無効化
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
                            onChange={handleDaysChange}
                            slotProps={{
                                input: {
                                    endAdornment: <InputAdornment position="end">日間</InputAdornment>,
                                },
                                htmlInput: {
                                    autoComplete: 'off', // オートコンプリートを無効化
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

                    <FormControlLabel 
                        control={<Checkbox onChange={handleWeatherChange} />} 
                        label="行き先の天気予報を調べる" 
                    />

                    <button 
                        className={styles.button} 
                        onClick={displayMySearch}
                    >これで検索する</button>
                    
                </div>
            </div>
        </div>
    )
}