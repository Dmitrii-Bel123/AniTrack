import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Wordmark from '../ui/Wordmark';

export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <main className="auth-page">
    <aside className="auth-story" aria-label="AniTrack — личный архив аниме">
      <Link to="/login" className="wordmark"><Wordmark /></Link>
      <div className="auth-story__copy"><p className="eyebrow"><span className="signal-dot" /> Личный архив аниме</p><h2>Истории,<br />которые<br /><em>с тобой.</em></h2><p>Смотри. Запоминай. Возвращайся.</p></div>
      <span className="auth-story__orbit" aria-hidden="true" />
      <p className="auth-story__footer">ANITRACK / ТВОЯ КОЛЛЕКЦИЯ ВПЕЧАТЛЕНИЙ</p>
    </aside>
    <section className="auth-content"><div className="auth-box fade-in"><header className="auth-header"><p className="eyebrow">( A ) — Твой аккаунт</p><h1>{title}<span className="heading-dot">.</span></h1><p>{subtitle}</p></header>{children}</div></section>
  </main>;
}
