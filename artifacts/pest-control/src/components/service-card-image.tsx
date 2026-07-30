import { getServiceImage, SERVICE_CARD_IMAGE } from "@/config/service-images";

type ServiceCardImageProps = {
  slug: string;
  alt: string;
  /** Override container height. Default: h-52 */
  height?: string;
};

export default function ServiceCardImage({ slug, alt, height = "h-52" }: ServiceCardImageProps) {
  return (
    <div className={`overflow-hidden ${height} w-full relative bg-secondary/20 group/img`}>
      <img
        src={getServiceImage(slug)}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={SERVICE_CARD_IMAGE.width}
        height={SERVICE_CARD_IMAGE.height}
        className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
      />
      {/* Gradient overlay at bottom for text readability if needed */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
    </div>
  );
}
