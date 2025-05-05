import styles from '../module_css/plan.module.css';

interface PlansProps {
    plans: Plan[];
    setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
}

type Plan = {
    id: number;
    title: string;
    days: number; // 旅行日数
    fromWhen: number; // 旅行開始日
    conectMemoId: string | null; // メモへの参照
    isPublic: boolean; // 公開フラグ
    createAt: Date;
}

export default function Plans({plans, setPlans}: PlansProps) {
    return (
        <div className={styles.main}>
            jdぁjdlSFあs
        </div>
    )
}