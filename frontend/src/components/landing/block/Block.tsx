import "./Block.css";

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
    <article className="block">
      <img
        src={src}
        alt="Block Imagen 1"
        className="img"
        style={reverse ? { order: 0 } : { order: 2 }}
      />
      <div className="info-container">
        <h2 className="title">{title}</h2>
        <p className="description">{description}</p>
      </div>
    </article>
  );
}
