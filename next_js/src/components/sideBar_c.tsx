import React from 'react';
import styles from './module_css/sideBar_c.module.css';
import LuggageIcon from '@mui/icons-material/Luggage';
import MapIcon from '@mui/icons-material/Map';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';

interface SideBarProps {
    select: string;
    setSelect: React.Dispatch<React.SetStateAction<string>>;
}

export default function SideBar_c({ select, setSelect }: SideBarProps) {
    const handleSelectChange = (newSelect: string) => {
        setSelect(newSelect);
    };

    const getClassName = (option: string) => {
        return select === option ? `${styles.li} ${styles.selected}` : styles.li;
    };

    return (
        <div className={styles.main}>
            <nav className={styles.contents}>
                <ul className={styles.ul}>
                    <li 
                        className={getClassName('plan')}
                        onClick={() => handleSelectChange('plan')}
                    >
                        <span>
                            <LuggageIcon
                                sx={{
                                    fontSize: "1.9rem",
                                    marginLeft: "5px",
                                }}
                            />
                        </span>
                        <span className={styles.text}>旅行計画</span>
                    </li>
                    <li 
                        className={getClassName('search')}
                        onClick={() => handleSelectChange('search')}
                    >
                        <span>
                            <MapIcon
                                sx={{
                                    fontSize: "1.9rem",
                                    marginLeft: "5px",
                                }}
                            />
                        </span>
                        <span className={styles.text}>旅行先検索</span>
                    </li>
                    <li 
                        className={getClassName('memo')}
                        onClick={() => handleSelectChange('memo')}
                    >
                        <span>
                            <StickyNote2Icon
                                sx={{
                                    fontSize: "1.9rem",
                                    marginLeft: "5px",
                                }}
                            />
                        </span>
                        <span className={styles.text}>メモ</span>
                    </li>
                    <li 
                        className={getClassName('inquiry')}
                        onClick={() => handleSelectChange('inquiry')}
                    >
                        <span>
                            <ContactPhoneOutlinedIcon
                                sx={{
                                    fontSize: "1.9rem",
                                    marginLeft: "5px",
                                }}
                            />
                        </span>
                        <span className={styles.text}>お問い合わせ</span>
                    </li>
                    <li 
                        className={getClassName('setting')}
                        onClick={() => handleSelectChange('setting')}
                    >
                        <span>
                            <SettingsSuggestRoundedIcon
                                sx={{
                                    fontSize: "1.9rem",
                                    marginLeft: "5px",
                                }}
                            />
                        </span>
                        <span className={styles.text}>設定</span>
                    </li>
                </ul>
            </nav>
        </div> 
    )
}