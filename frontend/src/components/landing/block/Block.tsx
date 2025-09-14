import styles from "./Block.module.css";

type BlockInput = {
  title: string;
  description: string;
  src: string;
  reverse: boolean;
};

export default function Block({
  title,
  description,
  src,
  reverse,
}: BlockInput) {
  return (
    <article className={styles.block}>
      <img
        src={src}
        alt="Block Imagen 1"
        className={styles.img}
        style={reverse ? { order: 0 } : { order: 2 }}
      />
      <div className={styles["info-container"]}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  );
}
