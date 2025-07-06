  import Edit from "@/public/images/edit-2.svg";
  import mail from "@/public/images/sms.svg";
  import toIcon from "@/public/images/to.svg";
import Image from "next/image";
  export const EditIcon = ({ className = "", size, alt = "" }) => (
    <Image
      src={Edit}
      alt={alt}
      className={className}
      width={size}
      height={size}
    />
  );
  export const MailIcon = ({ className = "", size, alt = "Mail" }) => (
  <Image
    src={mail}
    alt={alt}
    className={className}
    width={size}
    height={size}
  />
);
export const ToIcon = ({ className = "", size, alt = "Github" }) => (
  <Image
    src={toIcon}
    alt={alt}
    className={className}
    width={size}
    height={size}
  />
);