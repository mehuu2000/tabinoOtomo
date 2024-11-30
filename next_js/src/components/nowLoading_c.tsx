import styles from './module_css/nowLoading_c.module.css'

export default function NowLoading_c() {
    return(
        <div className={styles.body}>
            <div className={styles.loader}>
                <span></span>
                <span></span>
                <span></span>
                <h2>Now Loading...</h2>
            </div>
        </div>
        
    )
}
