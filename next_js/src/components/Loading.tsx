import styles from './module_css/Loading.module.css'
import CircularProgress from '@mui/material/CircularProgress';

export default function NowLoading_c() {
    return(
        <div className={styles.body}>
            <CircularProgress color="secondary" />
            <h2>Now Loading...</h2>
        </div>
        
    )
}
