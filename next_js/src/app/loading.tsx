import styles from '../components/module_css/nowLoading_c.module.css';

const Loading = () => {
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

export default Loading