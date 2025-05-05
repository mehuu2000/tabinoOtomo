// // components/Auth.tsx
// "use client";

// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function Auth({ children }: { children: React.ReactNode }) {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/TabinoOtomo/login");
//     }
//   }, [status, router]);

//   if (status === "loading") {
//     // セッションの確認中はローディング状態を表示
//     return <div>Loading...</div>;
//   }

//   if (session) {
//     // 認証済みの場合、子要素を表示
//     return <>{children}</>;
//   }

//   // 未認証の場合、リダイレクト処理中の一時的な空表示
//   return null;
// }
