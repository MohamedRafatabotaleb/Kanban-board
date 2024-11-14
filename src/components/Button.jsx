// components/button.ts
import { cva } from "class-variance-authority";

const button = cva("rounded-full px-6 duration-200 text-[13px] font-bold", {
  variants: {
    variant: {
      primary: "text-white bg-main-purple hover:bg-main-purple-hover",

      secondary: "text-main-purple bg-main-purple/10 hover:bg-main-purple/25",
      destructive: "text-white bg-red hover:bg-red-hover",
    },
    size: {
      sm: "h-5",
      lg: "h-12",
    },
    isFullWidth: {
      true: "w-full",
    },
    isDisabled: {
      true: "cursor-not-allowed opacity-25 hover:bg-main-purple",
    },
  },

  defaultVariants: {
    variant: "primary",
    size: "lg",
  },
});

const Button = ({
  children,
  variant,
  size,
  isFullWidth,
  calssName,
  isDisabled,
  ...props
}) => {
  return (
    <button
      className={button({ variant, size, isFullWidth, calssName, isDisabled })}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
