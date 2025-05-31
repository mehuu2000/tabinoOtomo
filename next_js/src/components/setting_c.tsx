'use client'

import React, { useState, useRef, useEffect } from 'react'
import styles from './module_css/chatAI.module.css';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CircularProgress from '@mui/material/CircularProgress';

// メッセージの型定義
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function Setting_c() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // デフォルトのユーザーアイコン
    const defaultUserIcon = '/images/default.png'; // デフォルトのユーザーアイコンパス

    // const FLASK_API_URL = process.env.FLASK_PUBLIC_API_URL; // Flask APIのURL
    
    // 初期メッセージ
    useEffect(() => {
      // コンポーネントマウント時に初期メッセージを追加
      setMessages([
        {
          id: 1,
          text: 'こんにちは！気軽に質問してくださいね',
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    }, []);
    
    // 新しいメッセージが追加されたら自動スクロール
    useEffect(() => {
      scrollToBottom();
    }, [messages]);
    
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // メッセージ送信処理
    const handleSendMessage = async () => {
      if (!inputMessage.trim()) return;
      
      // ユーザーのメッセージをチャット履歴に追加
      const userMessage: Message = {
        id: messages.length + 1,
        text: inputMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);
      
      try {
        // 以前のメッセージをコンテキストとして送信
        const previousMessages = messages
          .slice(-5) // 直近5件のメッセージをコンテキストとして使用
          .map(msg => ({
            text: msg.text,
            sender: msg.sender
          }));

        // Flaskサーバーにリクエスト
        const response = await fetch(`http://127.0.0.1:5000/chatAi`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: inputMessage,
            previousMessages: previousMessages
          }),
        });

        if (!response.ok) {
          throw new Error(`API エラー: ${response.status}`);
        }

        const result = await response.json();
        
        // AIの返答をチャット履歴に追加
        const aiMessage: Message = {
          id: messages.length + 2,
          text: result.response || '申し訳ありません、応答を生成できませんでした。',
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
      } catch (error) {
        console.error('AI応答エラー:', error);
        
        // エラーメッセージをチャット履歴に追加
        const errorMessage: Message = {
          id: messages.length + 2,
          text: '申し訳ありません。エラーが発生しました。もう一度お試しください。',
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // エンターキーでメッセージ送信
    // const handleKeyPress = (e: React.KeyboardEvent) => {
    //   if (e.key === 'Enter' && !e.shiftKey) {
    //     e.preventDefault();
    //     handleSendMessage();
    //   }
    // };

    // 日付のフォーマット
    const formatTime = (date: Date): string => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return(
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
            <h2>AIアシスタント</h2>
            <p>お気軽に質問してください</p>   
        </div>
        
        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`${styles.messageWrapper} ${message.sender === 'user' ? styles.userMessage : styles.aiMessage}`}
            >
              <div className={styles.messageAvatar}>
                {message.sender === 'user' ? (
                  <Image 
                    src={session?.user?.image || defaultUserIcon} 
                    alt="ユーザー" 
                    width={40} 
                    height={40} 
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.aiAvatar}>
                    <AutoAwesomeIcon />
                  </div>
                )}
              </div>
              <div className={styles.messageContent}>
                <div className={styles.messageBubble}>
                  <p>{message.text}</p>
                </div>
                <div className={styles.messageTime}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className={`${styles.messageWrapper} ${styles.aiMessage}`}>
              <div className={styles.messageAvatar}>
                <div className={styles.aiAvatar}>
                  <AutoAwesomeIcon />
                </div>
              </div>
              <div className={styles.messageContent}>
                <div className={`${styles.messageBubble} ${styles.loadingBubble}`}>
                  <CircularProgress size={20} thickness={5} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className={styles.inputContainer}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            // onKeyDown={handleKeyPress}
            placeholder="メッセージを入力..."
            className={styles.messageInput}
            rows={1}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={!inputMessage.trim() || isLoading}
            className={styles.sendButton}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    );
}