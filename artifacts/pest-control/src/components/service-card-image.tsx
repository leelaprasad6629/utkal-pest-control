import { getServiceImage, SERVICE_CARD_IMAGE } from "@/config/service-images";

type ServiceCardImageProps = {
  slug: string;
  alt: string;
};

export default function ServiceCardImage({ slug, alt }: ServiceCardImageProps) {
  return (
    <div className={SERVICE_CARD_IMAGE.containerClassName}>
      <img
        src={getServiceImage(slug)}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={SERVICE_CARD_IMAGE.width}
        height={SERVICE_CARD_IMAGE.height}
        className={SERVICE_CARD_IMAGE.className}
      />
    </div>
  );
}
