import styles from "./vacancy-description.module.css";

type VacancyDescriptionProps = {
  html: string;
};

export function VacancyDescription({ html }: VacancyDescriptionProps) {
  return (
    <section aria-label="Deskripsi lowongan">
      {/* Only render description_html returned by the backend HTML sanitizer. */}
      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
