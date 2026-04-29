import { useI18n } from '@/shared/i18n';
import { Header } from '@/widgets/header';
import styles from './Settings.module.css';

export function SettingsPage() {
  const { t, locale, setLocale, locales } = useI18n();

  return (
    <>
      <Header />
      <div className={styles.page}>
        <h1 className={styles.title}>{t('settings.title')}</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>{t('settings.language.heading')}</h2>
          <p className={styles.sectionDescription}>{t('settings.language.description')}</p>
          <div className={styles.options} role="radiogroup" aria-label={t('settings.language.heading')}>
            {locales.map(({ code, label }) => {
              const active = code === locale;
              return (
                <button
                  key={code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`${styles.option} ${active ? styles.optionActive : ''}`}
                  onClick={() => setLocale(code)}
                >
                  <span className={`${styles.radio} ${active ? styles.radioActive : ''}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
