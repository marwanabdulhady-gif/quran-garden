import React, { useEffect, useState } from 'react';
import { useGarden, activeChild, parseGardenLink, useStorageError } from './store.js';
import { setMuted, sfx } from './sound.js';
import Home from './Home.jsx';
import Garden from './Garden.jsx';
import Bridge from './Bridge.jsx';
import Words from './Words.jsx';
import Listening, { ListenReview } from './Listening.jsx';
import JourneyMap from './JourneyMap.jsx';
import Daily from './Daily.jsx';
import Settings from './Settings.jsx';
import Badges from './Badges.jsx';
import RestoreDialog from './RestoreDialog.jsx';
import { GATES } from './data.js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: false };
  }
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="screen" style={{ background: '#ecfdf5', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: 24, maxWidth: 420 }}>
            <div style={{ fontSize: 64 }}>🌵</div>
            <h1 style={{ fontWeight: 900, fontSize: 22, margin: '10px 0' }}>حصلت مشكلة في فتح الحديقة</h1>
            <p style={{ fontWeight: 700, color: '#6b7280', lineHeight: 2 }}>
              جرّب إعادة تحميل الصفحة. بيانات تقدمك المحفوظة هتفضل موجودة.
            </p>
            <button className="btn big" style={{ marginTop: 12 }} onClick={() => location.reload()}>
              🔄 إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// شريط اقتراح تثبيت التطبيق (PWA) على الجوال
function InstallBanner() {
  const [evt, setEvt] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const h = (e) => {
      e.preventDefault();
      setEvt(e);
    };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  if (!evt || dismissed) return null;
  const install = async () => {
    evt.prompt();
    setEvt(null);
    try {
      await evt.userChoice;
    } catch (e) {
      /* ما يهمش */
    }
  };
  return (
    <div className="install-banner">
      <span>
        📲 <b>حمّل حديقة القرآن على جهازك</b> — تشتغل حتى بدون إنترنت
      </span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button className="btn small" onClick={install}>
          تثبيت
        </button>
        <button className="icon-btn" onClick={() => setDismissed(true)} aria-label="إخفاء">
          ✕
        </button>
      </span>
    </div>
  );
}

export default function App() {
  const s = useGarden();
  const child = activeChild(s);
  const storageError = useStorageError();
  const [route, setRoute] = useState({ name: 'home', params: {} });
  const [pendingFamily, setPendingFamily] = useState(null);
  const [toast, setToast] = useState(null);

  const say = (m) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  // قراءة رابط استرجاع من العنوان عند الفتح
  useEffect(() => {
    const data = parseGardenLink(location.href);
    if (data && data.familyKey !== s.familyKey) setPendingFamily(data);
    // eslint-disable-next-line
  }, []);

  // كتم الأصوات حسب إعداد الطفل
  useEffect(() => {
    setMuted(!child.sound);
  }, [child.sound, child.id]);

  const go = (name, params = {}) => {
    window.scrollTo(0, 0);
    setRoute({ name, params });
  };

  return (
    <ErrorBoundary>
      {storageError && (
        <div className="storage-banner" role="alert">
          ⚠️ مساحة التخزين ممتلئة — نزّل نسخة احتياطية من الإعدادات واحذف صورًا قديمة
        </div>
      )}
      {route.name === 'home' && <Home go={go} />}
      {route.name === 'garden' && <Garden go={go} />}
      {route.name === 'bridge' && <Bridge go={go} initialView={route.params.review ? 'review' : 'list'} />}
      {route.name === 'words' && <Words go={go} />}
      {route.name === 'journey' && <JourneyMap go={go} />}
      {route.name === 'badges' && <Badges go={go} childId={route.params.childId} />}
      {route.name === 'gate' && <Listening gateId={route.params.gate} go={go} />}
      {route.name === 'player' && <Listening gateId={route.params.gate} surahNum={route.params.surah} go={go} />}
      {route.name === 'listen-review' && <ListenReviewRoute gateId={route.params.gate} go={go} />}
      {route.name === 'daily' && <Daily go={go} />}
      {route.name === 'settings' && <Settings go={go} />}

      {pendingFamily && (
        <RestoreDialog
          family={pendingFamily}
          onClose={() => {
            setPendingFamily(null);
            try {
              history.replaceState(null, '', location.pathname);
            } catch (e) {
              /* ما يهمش */
            }
          }}
          onApplied={say}
        />
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 84,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#065f46',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14,
            padding: '10px 20px',
            borderRadius: 999,
            zIndex: 80,
            animation: 'pop 0.25s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          {toast}
        </div>
      )}

      <InstallBanner />
    </ErrorBoundary>
  );
}

function ListenReviewRoute({ gateId, go }) {
  const gate = GATES.find((g) => g.id === gateId) || GATES[0];
  return <ListenReview gate={gate} go={go} />;
}
